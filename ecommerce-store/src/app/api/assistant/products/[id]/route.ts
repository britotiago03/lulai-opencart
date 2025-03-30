import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API route for the AI assistant to fetch product details
 * This is separate from the main product API to avoid conflicts
 */
export async function GET(
    _: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate that id is a number
        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
        }

        // Fetch basic product details (only what the assistant needs)
        const productResult = await pool.query(
            `SELECT 
                id, 
                name, 
                description, 
                price, 
                brand, 
                category, 
                stock
            FROM products 
            WHERE id = $1 
            LIMIT 1`,
            [id]
        );

        if (productResult.rows.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Return minimal product data needed for the assistant
        return NextResponse.json(productResult.rows[0], { status: 200 });
    } catch (error) {
        console.error("Error fetching product for assistant:", error);
        return NextResponse.json(
            { error: "Error fetching product details", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}