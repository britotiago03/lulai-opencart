import { NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";

// Initialize PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL!;
const EMAIL_USER = process.env.EMAIL_USER || "test@example.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "password";
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.example.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");

const pool = new Pool({ connectionString: DATABASE_URL });

// Create email transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export async function POST(req: Request) {
    try {
        const { sessionId, email, message } = await req.json();

        if (!sessionId || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get product data mentioned in the message
        const products = await getProductsForEmail(message);

        // Format the email content
        const htmlContent = formatEmailContent(message, products);

        // Send email
        await transporter.sendMail({
            from: `"AI Shopping Assistant" <${EMAIL_USER}>`,
            to: email,
            subject: "Your Product Information",
            html: htmlContent,
        });

        return NextResponse.json({
            success: true,
            message: "Email sent successfully"
        });
    } catch (error: any) {
        console.error("Error in send-email API:", error);
        return NextResponse.json(
            { error: error.message || "An error occurred" },
            { status: 500 }
        );
    }
}

// Helper to extract product information from the database
async function getProductsForEmail(message: string) {
    try {
        // Extract product names from the message
        // This is a simple approach - you could improve this with NLP or regex
        const productNames = message
            .split(/[.,\n]/g)
            .filter(part => part.includes('Product Name:') || part.includes('product name:'))
            .map(part => {
                const match = part.match(/Product Name:?\s*([^,\n]*)/i);
                return match ? match[1].trim() : null;
            })
            .filter((name): name is string => !!name);

        if (productNames.length === 0) {
            return [];
        }

        // Query database for these products
        const client = await pool.connect();
        try {
            // Build a parameterized query to find products by name
            const placeholders = productNames.map((_, i) => `$${i + 1}`).join(' OR name ILIKE ');
            const paramValues = productNames.map(name => `%${name}%`);

            const query = `
        SELECT 
          id, name, price, sku, model, image, 
          availability, currency, weight_or_size as "weightOrSize", 
          origin, aisle
        FROM products
        WHERE name ILIKE ${placeholders}
        LIMIT 10;
      `;

            const result = await client.query(query, paramValues);
            return result.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error retrieving products for email:", error);
        return []; // Return empty array if retrieval fails
    }
}

// Helper to format email content
function formatEmailContent(message: string, products: any[]): string {
    // Create a nice HTML email with product info
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Product Information</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f8f8; padding: 20px; border-bottom: 1px solid #ddd; }
        .product-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .product-table th, .product-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .product-table th { background-color: #f2f2f2; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Product Information</h1>
          <p>Here are the products you were interested in:</p>
        </div>
        
        ${products.length > 0 ? `
          <table class="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Weight/Size</th>
                <th>Origin</th>
                <th>Aisle</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td>${product.name || ''}</td>
                  <td>${product.price || ''} ${product.currency || ''}</td>
                  <td>${product.weightOrSize || ''}</td>
                  <td>${product.origin || ''}</td>
                  <td>${product.aisle || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <p>We couldn't find specific product details in our database. Please see the message below:</p>
          <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ddd;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        `}
        
        <div class="footer">
          <p>This email was sent from your AI Shopping Assistant.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}