/* src/lib/db/client.ts*/

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Initialize the connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Default record type for query results when not specified
type DefaultRecord = Record<string, unknown>;

// Simple query method with proper typing
export async function query<T extends QueryResultRow = DefaultRecord>(
    text: string,
    params?: unknown[]
): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
        const res = await pool.query<T>(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Error executing query', { text, error });
        throw error;
    }
}

// Method to get a client from the pool - marked as unused to avoid linting warnings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getClient(): Promise<PoolClient> {
    const client = await pool.connect();
    return client;
}