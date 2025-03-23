// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/auth-config";
import pool from "@/lib/db";
import { sendEventToAll } from '@/app/api/events/route';
import {
    extractProductData,
    extractDescriptionData,
    createDescriptionFile,
    processProductImages,
    cleanupResources
} from "@/lib/product-utils";

// GET /api/admin/products - Get all products with optional filtering
export async function GET(request: NextRequest) {
    try {
        // Verify admin session
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        // Get query parameters for filtering
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const brand = searchParams.get('brand');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'name';
        const order = searchParams.get('order') || 'asc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Build the query
        let query = `SELECT id, name, brand, category, price, 
                     images, description_file, url
                     FROM products`;

        // Add WHERE clauses for filtering
        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (category) {
            conditions.push(`category = $${paramIndex++}`);
            params.push(category);
        }

        if (brand) {
            conditions.push(`brand = $${paramIndex++}`);
            params.push(brand);
        }

        if (search) {
            conditions.push(`(name ILIKE $${paramIndex} OR brand ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Add sorting and pagination
        query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        // Count total products for pagination
        let countQuery = `SELECT COUNT(*) FROM products`;
        if (conditions.length > 0) {
            countQuery += ` WHERE ${conditions.join(' AND ')}`;
        }

        // Execute both queries
        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            const countResult = await client.query(countQuery, params.slice(0, -2)); // Remove limit and offset

            const totalProducts = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalProducts / limit);

            return NextResponse.json({
                products: result.rows,
                pagination: {
                    page,
                    limit,
                    totalProducts,
                    totalPages
                }
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Error fetching products", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        // Verify admin session
        const session = await getServerSession(adminAuthOptions);

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
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

        // Process and validate images
        const imagesResult = await processProductImages(formData);
        if (!imagesResult.isValid) {
            return imagesResult.error || NextResponse.json(
                { error: "Invalid image data" },
                { status: 400 }
            );
        }

        const imageUrls = imagesResult.imageUrls;

        // Extract description data
        const descriptionData = extractDescriptionData(formData, name);

        // Create the description file
        const { absolutePath: descriptionPath, relativePath: descriptionFilePath } =
            await createDescriptionFile(descriptionData);

        // Insert the product into the database
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO products (name, brand, category, price, images, description_file, url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, name, brand, category, price, images, description_file, url`,
                [
                    name,
                    brand,
                    category || 'Uncategorized',
                    price,
                    JSON.stringify(imageUrls),
                    descriptionFilePath,
                    urlPath
                ]
            );

            await client.query('COMMIT');

            const newProduct = result.rows[0];

            // Notify connected clients about the new product
            sendEventToAll('product-updated', {
                id: newProduct.id,
                name: newProduct.name,
                price: newProduct.price,
                stock: 0, // You might want to add a stock field to your schema
                updatedAt: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                product: newProduct,
                message: "Product created successfully"
            });
        } catch (dbError) {
            await client.query('ROLLBACK');

            // Cleanup resources on failure
            await cleanupResources(descriptionPath, imageUrls);

            // Return error response instead of throwing
            return NextResponse.json(
                { error: "Database error when creating product", details: dbError instanceof Error ? dbError.message : String(dbError) },
                { status: 500 }
            );
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Error creating product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}