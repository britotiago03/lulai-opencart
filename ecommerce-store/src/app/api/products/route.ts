import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const search = url.searchParams.get("search") || "";
        const category = url.searchParams.get("category") || "";
        const minPrice = url.searchParams.get("minPrice");
        const maxPrice = url.searchParams.get("maxPrice");
        const brand = url.searchParams.get("brand") || "";

        let query = "SELECT * FROM products WHERE 1=1";
        const values: (string | number)[] = [];

        if (search) {
            values.push(`%${search}%`);
            query += ` AND name ILIKE $${values.length}`;
        }

        if (category) {
            values.push(category);
            query += ` AND category = $${values.length}`;
        }

        if (brand) {
            values.push(brand);
            query += ` AND brand = $${values.length}`;
        }

        if (minPrice) {
            values.push(parseFloat(minPrice));
            query += ` AND price >= $${values.length}`;
        }

        if (maxPrice) {
            values.push(parseFloat(maxPrice));
            query += ` AND price <= $${values.length}`;
        }

        const result = await pool.query(query, values);
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error: "Error fetching products", details: error }, { status: 500 });
    }
}
