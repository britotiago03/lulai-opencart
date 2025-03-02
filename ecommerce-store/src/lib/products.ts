import pool from "@/lib/db";

export async function getProducts() {
    const result = await pool.query("SELECT * FROM products ORDER BY id DESC LIMIT 4");
    return result.rows;
}
