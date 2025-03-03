import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";

interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    images: string[];
    description_file: string;
    reviews: { rating: number; comment: string; reviewer: string }[];
}

interface Description {
    title: string;
    overview: string;
    details: string[];
    specifications: Record<string, string>;
}

// ✅ Ensure we fetch the product with an absolute API URL
async function fetchProduct(id: string): Promise<Product | null> {
    const apiUrl = process.env.API_URL || "http://localhost:3000";
    const res = await fetch(`${apiUrl}/api/products/${id}`, { cache: "force-cache" });

    if (!res.ok) return null;
    return res.json();
}

// ✅ Ensure correct description file URL
async function fetchDescription(descriptionFile: string | null): Promise<Description | null> {
    if (!descriptionFile) return null;

    try {
        const apiUrl = process.env.API_URL || "http://localhost:3000";

        // ✅ Convert relative paths like `/descriptions/macbook_air.json` to an absolute URL
        const descriptionUrl = descriptionFile.startsWith("http") ? descriptionFile : `${apiUrl}${descriptionFile}`;

        const res = await fetch(descriptionUrl, { cache: "no-store" }); // Don't cache in case descriptions update frequently
        return res.ok ? await res.json() : null;
    } catch (error) {
        console.error("Error fetching description:", error);
        return null;
    }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    // Await the params object before accessing it
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.id) return notFound();

    const product = await fetchProduct(resolvedParams.id);
    if (!product) return notFound();

    const description = await fetchDescription(product.description_file);

    return <ProductDetailsClient product={product} description={description} />;
}