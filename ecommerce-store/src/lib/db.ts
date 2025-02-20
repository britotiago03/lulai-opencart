import { Pool } from "pg";

const pool = new Pool({
    user: "postgres",
    host: "postgres", // Use the service name instead of 'localhost'
    database: "ecommerce_db",
    password: "postgres",
    port: 5432,
});

export default pool;
