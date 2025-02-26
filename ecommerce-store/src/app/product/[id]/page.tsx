"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    const [productId, setProductId] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [description, setDescription] = useState<Description | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void (async () => {
            const resolvedParams = await params;
            setProductId(resolvedParams.id);
        })();
    }, [params]);

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

        void fetchProduct();
    }, [productId]);

    if (!productId) return <p className="text-center text-gray-500">Loading product details...</p>;
    if (loading) return <p className="text-center text-gray-500">Loading product details...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!product) return notFound();

    return (
        <div className="container mx-auto p-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* ✅ Product Image Slider */}
                <div className="w-full md:w-1/2">
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        autoplay={{ delay: 3000 }}
                        pagination={{ clickable: true }}
                        navigation
                        loop
                        className="w-full rounded-lg"
                    >
                        {product.images.map((image, index) => (
                            <SwiperSlide key={index} className="flex justify-center">
                                <div className="relative w-full h-[350px]">
                                    <Image
                                        src={image}
                                        alt={product.name}
                                        layout="fill"
                                        objectFit="contain"
                                        className="rounded-lg bg-white"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* ✅ Product Details */}
                <div className="w-full md:w-1/2 space-y-4">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-gray-500">{product.brand}</p>
                    <p className="text-2xl font-semibold">${product.price.toFixed(2)}</p>

                    {/* ✅ Add to Cart Button */}
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                        onClick={() => alert(`Added ${product.name} to cart!`)}
                    >
                        🛒 Add to Cart
                    </button>
                </div>
            </div>

            {/* ✅ Product Description */}
            {description && (
                <div className="mt-8">
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

            {/* ✅ Reviews Section */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                {product.reviews.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                        {product.reviews.map((review, index) => (
                            <li key={index} className="border p-4 rounded-lg shadow-md bg-gray-50">
                                <p className="text-lg font-semibold">{review.reviewer}</p>
                                <p className="text-yellow-500">⭐ {review.rating}/5</p>
                                <p className="text-gray-700">{review.comment}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 mt-2">No reviews yet.</p>
                )}
            </div>
        </div>
    );
}
