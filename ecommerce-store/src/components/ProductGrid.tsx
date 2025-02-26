"use client";

import Image from "next/image";
import Link from "next/link";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="border p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 flex flex-col items-center text-center">
                        {/* ✅ Fixed Image Sizes */}
                        <div className="relative w-[250px] h-[200px]">
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg bg-white"
                            />
                        </div>

                        <h2 className="text-xl font-bold mt-4">{product.name}</h2>
                        <p className="text-gray-500">{product.brand}</p>
                        <p className="text-lg font-semibold mt-2">${product.price.toFixed(2)}</p>

                        {descriptions[product.id] && (
                            <p className="text-gray-700 mt-2 line-clamp-2">{descriptions[product.id].overview}</p>
                        )}

                        {/* ✅ Clickable Hover Effect */}
                        <div className="opacity-0 group-hover:opacity-100 transition duration-300 mt-2">
                            <span className="text-blue-500 underline">View Product →</span>
                        </div>

                        {/* ✅ Add to Cart Button (Independent Click) */}
                        <button
                            onClick={(e) => {
                                e.preventDefault(); // Prevents navigation when clicking "Add to Cart"
                                alert(`Added ${product.name} to cart!`);
                            }}
                            className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition w-full"
                        >
                            🛒 Add to Cart
                        </button>
                    </div>
                </Link>
            ))}
        </div>
    );
}
