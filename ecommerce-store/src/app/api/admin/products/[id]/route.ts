// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/auth-config";
import pool from "@/lib/db";
import { deleteImage } from "@/lib/storage";
import { promises as fs } from 'fs';
import path from 'path';
import { sendEventToAll } from '@/app/api/events/route';
import {
    extractProductData,
    extractDescriptionData,
    processProductImages,
    processImageDeletions,
    DescriptionData
} from "@/lib/product-utils";

// GET /api/admin/products/[id] - Get a specific product
export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin session
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = params;

        // Validate ID is a number
        if (!/^\d+$/.test(id)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        // Fetch product from database
        const result = await pool.query(
            `SELECT id, name, brand, category, price, images, description_file, url
             FROM products
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const product = result.rows[0];

        // Load the description file
        try {
            const descriptionPath = path.join(process.cwd(), 'public', product.description_file);
            const descriptionContent = await fs.readFile(descriptionPath, 'utf-8');
            product.description = JSON.parse(descriptionContent);
        } catch (error) {
            console.error(`Error reading description file for product ${id}:`, error);
            product.description = {
                title: product.name,
                overview: "Description file not found",
                details: [],
                specifications: {}
            };
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Error fetching product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// PUT /api/admin/products/[id] - Update a product
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin session
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = params;

        // Validate ID is a number
        if (!/^\d+$/.test(id)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        // Parse the form data
        const formData = await request.formData();

        // Extract and validate product data
        const productDataResult = await extractProductData(formData);
        if (!productDataResult.isValid || !productDataResult.data) {
            return productDataResult.error || NextResponse.json(
                { error: "Invalid product data" },
                { status: 400 }
            );
        }

        const { name, brand, category, price, urlPath } = productDataResult.data;

        // Get current product data
        const currentProductResult = await pool.query(
            `SELECT images, description_file FROM products WHERE id = $1`,
            [id]
        );

        if (currentProductResult.rows.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const currentProduct = currentProductResult.rows[0];
        const currentImages = JSON.parse(currentProduct.images);

        // Extract description data
        const descriptionData: DescriptionData = extractDescriptionData(formData, name);

        // Process image deletions
        const imagesToDelete = processImageDeletions(formData);

        // Filter out images to delete
        let updatedImages = currentImages.filter((img: string) =>
            !imagesToDelete.includes(img)
        );

        // Process new images if any
        const imagesResult = await processProductImages(formData, true);
        if (imagesResult.imageUrls.length > 0) {
            updatedImages = [...updatedImages, ...imagesResult.imageUrls];
        }

        // Ensure there's at least one image
        const keepOldImages = formData.get('keepOldImages') === 'true';
        if (!keepOldImages && updatedImages.length === 0) {
            return NextResponse.json(
                { error: "At least one image is required" },
                { status: 400 }
            );
        }

        try {
            // Update the existing description file
            const descriptionPath = path.join(process.cwd(), 'public', currentProduct.description_file);
            await fs.writeFile(
                descriptionPath,
                JSON.stringify(descriptionData, null, 2)
            );
        } catch (fileError) {
            console.error(`Error updating description file for product ${id}:`, fileError);
            return NextResponse.json(
                { error: "Error updating product description file" },
                { status: 500 }
            );
        }

        // Update the product in the database
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `UPDATE products 
                 SET name = $1, brand = $2, category = $3, price = $4, 
                     images = $5, url = $6
                 WHERE id = $7
                 RETURNING id, name, brand, category, price, images, description_file, url`,
                [
                    name,
                    brand,
                    category || 'Uncategorized',
                    price,
                    JSON.stringify(updatedImages),
                    urlPath,
                    id
                ]
            );

            await client.query('COMMIT');

            const updatedProduct = result.rows[0];

            // Delete the images that were marked for deletion
            for (const imageUrl of imagesToDelete) {
                try {
                    await deleteImage(imageUrl);
                } catch (imageError) {
                    console.error(`Error deleting image ${imageUrl}:`, imageError);
                    // Continue with next image even if one fails
                }
            }

            // Notify connected clients about the updated product
            sendEventToAll('product-updated', {
                id: updatedProduct.id,
                name: updatedProduct.name,
                price: updatedProduct.price,
                stock: 0, // You might want to add a stock field to your schema
                updatedAt: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                product: updatedProduct,
                message: "Product updated successfully"
            });
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error("Database error when updating product:", dbError);
            return NextResponse.json(
                { error: "Database error when updating product" },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: "Error updating product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/products/[id] - Delete a product
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify admin session
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const { id } = params;

        // Validate ID is a number
        if (!/^\d+$/.test(id)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        // Get product data first to handle file cleanup
        const productResult = await pool.query(
            `SELECT images, description_file FROM products WHERE id = $1`,
            [id]
        );

        if (productResult.rows.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const product = productResult.rows[0];

        // Delete the product from the database
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM products WHERE id = $1`,
                [id]
            );

            await client.query('COMMIT');

            // Clean up the description file
            try {
                const descriptionPath = path.join(process.cwd(), 'public', product.description_file);
                await fs.unlink(descriptionPath);
            } catch (fileError) {
                console.error(`Error deleting description file for product ${id}:`, fileError);
                // Continue with cleanup even if file deletion fails
            }

            // Clean up image files
            const images = JSON.parse(product.images);
            for (const imageUrl of images) {
                try {
                    await deleteImage(imageUrl);
                } catch (imageError) {
                    console.error(`Error deleting image ${imageUrl}:`, imageError);
                    // Continue with next image even if one fails
                }
            }

            return NextResponse.json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (dbError) {
            await client.query('ROLLBACK');
            console.error("Database error when deleting product:", dbError);
            return NextResponse.json(
                { error: "Database error when deleting product" },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Error deleting product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}