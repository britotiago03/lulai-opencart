"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    images: string[];
    description_file: string;
}

interface Description {
    title: string;
    overview: string;
    details: string[];
    specifications: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    const [productId, setProductId] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [description, setDescription] = useState<Description | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ Unwrap params promise
    useEffect(() => {
        void (async () => {
            const resolvedParams = await params;
            setProductId(resolvedParams.id);
        })();
    }, [params]);

    // ✅ Fetch product data after params are loaded
    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        setError(null);

        const fetchProduct = async () => {
            try {
                const productRes = await fetch(`${API_BASE_URL}/api/products/${productId}`);
                if (!productRes.ok) {
                    setError("Product not found.");
                    setLoading(false);
                    return;
                }

                const productData: Product = await productRes.json();
                setProduct(productData);

                const descRes = await fetch(`${API_BASE_URL}${productData.description_file}`);
                if (!descRes.ok) {
                    setError("Description not found.");
                    setLoading(false);
                    return;
                }

                const descData: Description = await descRes.json();
                setDescription(descData);
            } catch (error) {
                console.error("Error fetching product:", error);
                setError(error instanceof Error ? error.message : "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        void fetchProduct(); // ✅ Indicate intentional async call
    }, [productId]);

    if (!productId) return <p className="text-center text-gray-500">Loading product details...</p>;
    if (loading) return <p className="text-center text-gray-500">Loading product details...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!product) return notFound();

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-500">{product.brand}</p>
            <p className="text-lg font-semibold mt-2">${product.price.toFixed(2)}</p>

            {/* ✅ Image Fix */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {product.images.map((image, index) => (
                    <div key={index} className="relative w-[200px] h-[150px]">
                        <Image
                            src={image}
                            alt={product.name}
                            width={200} // ✅ Fixed width
                            height={150} // ✅ Fixed height
                            style={{ objectFit: "contain" }}
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>

            {description && (
                <div className="mt-4">
                    <h2 className="text-2xl font-bold">{description.title}</h2>
                    <p className="mt-2">{description.overview}</p>

                    <h3 className="text-xl font-bold mt-4">Details</h3>
                    <ul className="list-disc pl-5">
                        {description.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-bold mt-4">Specifications</h3>
                    <ul className="list-disc pl-5">
                        {Object.entries(description.specifications).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
