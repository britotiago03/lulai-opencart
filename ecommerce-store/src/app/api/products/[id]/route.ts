import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(_: Request, context: { params: { id?: string } }) {
    try {
        const { params } = context; // ✅ No 'await' needed

        if (!params?.id) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const productId = parseInt(params.id, 10);
        if (isNaN(productId)) {
            return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
        }

        const result = await pool.query("SELECT * FROM products WHERE id = $1 LIMIT 1", [productId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Error fetching product", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
