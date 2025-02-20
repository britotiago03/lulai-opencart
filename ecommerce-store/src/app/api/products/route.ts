import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query("SELECT * FROM products");
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching products", details: error }, { status: 500 });
    }
}
