import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Update the function signature to match Next.js expectations
export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Use a more resilient approach to handling params
        const resolvedParams = 'then' in params ? await params : params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        // Parse ID safely
        const productId = Number(id);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        // Fetch product details
        const productResult = await pool.query("SELECT * FROM products WHERE id = $1 LIMIT 1", [productId]);
        if (productResult.rows.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const product = productResult.rows[0];

        // Fetch reviews
        const reviewsResult = await pool.query(
            `SELECT reviews.rating, reviews.comment, users.name AS reviewer
            FROM reviews
            JOIN users ON reviews.user_id = users.id
            WHERE reviews.product_id = $1`,
            [productId]
        );

        return NextResponse.json({ ...product, reviews: reviewsResult.rows }, { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Error fetching product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}