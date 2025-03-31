import pool from "@/lib/db";

/**
 * Get store information for context in the AI prompt
 * @returns A string containing store information for the AI prompt
 */
export async function getStoreInfo(): Promise<string> {
    try {
        // Get categories
        const categoryResult = await pool.query(
            "SELECT DISTINCT category FROM products"
        );
        const categories = categoryResult.rows.map(row => row.category);

        // Get brands
        const brandResult = await pool.query(
            "SELECT DISTINCT brand FROM products"
        );
        const brands = brandResult.rows.map(row => row.brand);

        return `
This e-commerce store sells electronic products.

Available pages:
- Home page: /
- Products listing: /products
- Individual product pages: /product/{id}
- Shopping cart: /cart
- Account page: /account
- Login: /auth/login
- Sign up: /auth/signup

Product categories: ${categories.join(', ')}
Brands available: ${brands.join(', ')}

Store policies:
- Free shipping on orders over $50
- 30-day return policy
- 10% discount for first-time customers with code WELCOME10
`;
    } catch (error) {
        console.error("Error getting store info:", error);
        return "Electronic products e-commerce store with various categories and brands.";
    }
}