import { Pool, PoolClient } from "pg";
import { CustomerInfo } from "@/types/order";

const pool = new Pool({
    user: "postgres",
    host: "postgres", // Use the service name instead of 'localhost'
    database: "ecommerce_db",
    password: "postgres",
    port: 5432,
});

// Interface for cart items sent from client
export interface CartItem {
    productId: number;
    quantity: number;
    price: number;
}

// Function to calculate order totals
export function calculateOrderTotals(cartItems: CartItem[]) {
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    // These could be configured through env variables or fetched from database in a full app
    const shippingAmount = 5.99;
    const taxRate = 0.08;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingAmount + taxAmount;

    return {
        subtotal,
        shippingAmount,
        taxAmount,
        totalAmount
    };
}

// Function to insert shipping address
export async function insertShippingAddress(
    client: PoolClient,
    orderId: number,
    customerInfo: CustomerInfo
): Promise<void> {
    await client.query(
        `INSERT INTO shipping_addresses
        (order_id, first_name, last_name, email, phone, address, city, state, zip_code, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
            orderId,
            customerInfo.firstName,
            customerInfo.lastName,
            customerInfo.email,
            customerInfo.phone,
            customerInfo.address,
            customerInfo.city,
            customerInfo.state,
            customerInfo.zipCode,
            customerInfo.country
        ]
    );
}

// Function to insert order items
export async function insertOrderItems(
    client: PoolClient,
    orderId: number,
    cartItems: CartItem[]
): Promise<void> {
    for (const item of cartItems) {
        const itemTotal = item.price * item.quantity;

        await client.query(
            `INSERT INTO order_items
            (order_id, product_id, quantity, price, total)
            VALUES ($1, $2, $3, $4, $5)`,
            [orderId, item.productId, item.quantity, item.price, itemTotal]
        );
    }
}

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


export default pool;
