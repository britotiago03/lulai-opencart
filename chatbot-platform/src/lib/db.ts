// src/lib/db.ts
import { Pool } from 'pg';

const createPool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ?
            { rejectUnauthorized: false } : false
    });
};

const pool = createPool();

export { pool };