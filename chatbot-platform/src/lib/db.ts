// src/lib/db.ts
import { Pool, PoolClient } from 'pg';

const createPool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ?
            { rejectUnauthorized: false } : false
    });
};

const pool = createPool();

// Function to execute a transaction
export async function executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction error:', error);
        throw error;
    } finally {
        client.release();
    }
}

export { pool };