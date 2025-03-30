import pool from "@/lib/db";
import { Product } from '../types';

/**
 * Get product context based on user message and extracted terms
 * @param productTerms - Extracted relevant terms from user message
 * @returns A string containing product context for the AI prompt
 */
export async function getProductContext(productTerms: string[]): Promise<string> {
    try {
        if (productTerms.length === 0) {
            // If no specific terms, return top products as context
            const result = await pool.query(
                "SELECT id, name, brand, category, price FROM products LIMIT 10"
            );

            if (result.rows.length === 0) {
                return "No products found in the database.";
            }

            return "Top products available:\n" + result.rows.map((product: Product) =>
                `ID: ${product.id}, Name: ${product.name}, Brand: ${product.brand}, Category: ${product.category}, Price: $${product.price}`
            ).join('\n');
        }

        // Create multiple query conditions for more effective matching
        let query = `
            SELECT id, name, brand, category, price 
            FROM products 
            WHERE 
        `;

        // Combine terms with OR for flexible matching, but use different ILIKE patterns
        const whereClauses = [];
        const params = [];

        // First, look for exact matches with multiple terms together
        if (productTerms.length > 1) {
            const combinedTerms = productTerms.join(' ');
            params.push(`%${combinedTerms}%`);
            whereClauses.push(`name ILIKE $${params.length}`);
        }

        // Then individual term matching
        for (const term of productTerms) {
            params.push(`%${term}%`);
            whereClauses.push(`name ILIKE $${params.length}`);
        }

        // Also search in brand and category
        for (const term of productTerms) {
            params.push(`%${term}%`);
            whereClauses.push(`brand ILIKE $${params.length}`);

            params.push(`%${term}%`);
            whereClauses.push(`category ILIKE $${params.length}`);
        }

        query += whereClauses.join(' OR ');
        query += ' ORDER BY (';

        // Add scoring for result relevance
        const scoringClauses = [];
        let paramIndex = params.length;

        // Score exact matches higher
        for (let i = 0; i < productTerms.length; i++) {
            paramIndex++;
            scoringClauses.push(`CASE WHEN name ILIKE '%' || $${paramIndex} || '%' THEN 3 ELSE 0 END`);
            params.push(productTerms[i]);
        }

        // Score brand matches
        for (let i = 0; i < productTerms.length; i++) {
            paramIndex++;
            scoringClauses.push(`CASE WHEN brand ILIKE '%' || $${paramIndex} || '%' THEN 2 ELSE 0 END`);
            params.push(productTerms[i]);
        }

        // Score category matches
        for (let i = 0; i < productTerms.length; i++) {
            paramIndex++;
            scoringClauses.push(`CASE WHEN category ILIKE '%' || $${paramIndex} || '%' THEN 1 ELSE 0 END`);
            params.push(productTerms[i]);
        }

        query += scoringClauses.join(' + ');
        query += ') DESC LIMIT 5';

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            // Fall back to a simpler search if the advanced search returned nothing
            const simpleQuery = `
                SELECT id, name, brand, category, price 
                FROM products 
                WHERE name ILIKE $1 OR brand ILIKE $1 OR category ILIKE $1
                LIMIT 5
            `;

            const simpleResult = await pool.query(simpleQuery, [`%${productTerms[0]}%`]);

            if (simpleResult.rows.length === 0) {
                return "No matching products found.";
            }

            return "Potential matching products:\n" + simpleResult.rows.map((product: Product) =>
                `ID: ${product.id}, Name: ${product.name}, Brand: ${product.brand}, Category: ${product.category}, Price: $${product.price}`
            ).join('\n');
        }

        // Format product information
        return "Best matching products for your query:\n" + result.rows.map((product: Product) =>
            `ID: ${product.id}, Name: ${product.name}, Brand: ${product.brand}, Category: ${product.category}, Price: $${product.price}`
        ).join('\n');

    } catch (error) {
        console.error("Error getting product context:", error);
        return "Error retrieving product context.";
    }
}

/**
 * Find product ID by name or other identifying information
 * @param productIdentifier - The product name/identifier to search for
 * @returns The product ID if found, or null if not found
 */
export async function findProductIdByName(productIdentifier: string): Promise<number | null> {
    try {
        // Clean up product identifier
        const searchTerm = productIdentifier.toLowerCase().trim();

        // First try exact match on product name
        let result = await pool.query(
            "SELECT id FROM products WHERE LOWER(name) = $1 LIMIT 1",
            [searchTerm]
        );

        if (result.rows.length > 0) {
            return result.rows[0].id;
        }

        // Try partial match on product name
        result = await pool.query(
            "SELECT id FROM products WHERE LOWER(name) LIKE $1 ORDER BY LENGTH(name) ASC LIMIT 1",
            [`%${searchTerm}%`]
        );

        if (result.rows.length > 0) {
            return result.rows[0].id;
        }

        // Try matching on brand + general terms
        const terms = searchTerm.split(/\s+/);
        if (terms.length > 1) {
            // Try to find a brand match first
            const brandResult = await pool.query(
                "SELECT DISTINCT brand FROM products WHERE LOWER(brand) LIKE $1 LIMIT 1",
                [`%${terms[0]}%`]
            );

            if (brandResult.rows.length > 0) {
                const brand = brandResult.rows[0].brand;
                // Now search for products with this brand and remaining terms
                const remainingTerms = terms.slice(1).join(' ');

                result = await pool.query(
                    "SELECT id FROM products WHERE LOWER(brand) = $1 AND LOWER(name) LIKE $2 LIMIT 1",
                    [brand.toLowerCase(), `%${remainingTerms}%`]
                );

                if (result.rows.length > 0) {
                    return result.rows[0].id;
                }
            }
        }

        return null;
    } catch (error) {
        console.error("Error finding product by name:", error);
        return null;
    }
}