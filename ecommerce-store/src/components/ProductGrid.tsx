"use client";

import Image from "next/image";
import { useRouter } from "next/navigation"; // Import the router
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

export default function ProductGrid({ products }: { products: Product[] }) {
    const [descriptions, setDescriptions] = useState<Record<number, Description>>({});
    const router = useRouter(); // Initialize router

    useEffect(() => {
        const fetchDescriptions = async () => {
            const descData: Record<number, Description> = {};

            await Promise.all(
                products.map(async (product) => {
                    try {
                        const response = await fetch(product.description_file);
                        descData[product.id] = await response.json();
                    } catch (error) {
                        console.error(`Error loading description for ${product.name}`, error);
                    }
                })
            );

            setDescriptions(descData);
        };

        (async () => {
            if (products.length > 0) {
                await fetchDescriptions();
            }
        })();
    }, [products]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="border p-4 rounded-lg shadow-md">
                    {/* Display the first product image */}
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="rounded-lg mb-4"
                    />

                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <p className="text-gray-500">{product.brand}</p>
                    <p className="text-lg font-semibold mt-2">${product.price.toFixed(2)}</p>

                    {descriptions[product.id] && (
                        <p className="text-gray-700 mt-2">{descriptions[product.id].overview}</p>
                    )}

                    {/* Navigate to product details */}
                    <button
                        onClick={() => router.push(`/product/${product.id}`)}
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        View Details
                    </button>
                </div>
            ))}
        </div>
    );
}
