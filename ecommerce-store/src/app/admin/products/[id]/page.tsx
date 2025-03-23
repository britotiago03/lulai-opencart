"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useProduct } from "@/hooks/useProduct";

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params?.id as string;

    const { product, loading, error } = useProduct(productId);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        try {
            setDeleting(true);
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                let errorMessage = "Failed to delete product";
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (parseError) {
                    console.error("Error parsing error response:", parseError);
                }

                console.error("Server returned error:", errorMessage);
                toast.error(errorMessage);
                setConfirmDelete(false);
                return;
            }

            toast.success("Product deleted successfully");
            router.push("/admin/products");
        } catch (err) {
            console.error("Error deleting product:", err);
            toast.error(err instanceof Error ? err.message : "Error deleting product");
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        setConfirmDelete(false);
    };

    // Format price
    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-red-800 text-white p-6 rounded-lg">
                <h1 className="text-xl font-bold mb-4">Error Loading Product</h1>
                <p>{error || "Product not found"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">{product.name}</h1>

                <div className="flex space-x-3">
                    <Link
                        href={`/admin/products/${productId}/edit`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Edit Product
                    </Link>

                    {confirmDelete ? (
                        <>
                            <button
                                onClick={() => void handleDelete()}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Confirm Delete"}
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => void handleDelete()}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Delete Product
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="relative h-80 w-full rounded-md overflow-hidden mb-4">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[selectedImageIndex].startsWith('/')
                                        ? product.images[selectedImageIndex]
                                        : `/${product.images[selectedImageIndex]}`}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-700 flex items-center justify-center text-gray-400">
                                    No Image Available
                                </div>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {product.images.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className={`relative h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                                            selectedImageIndex === index
                                                ? 'border-blue-500'
                                                : 'border-gray-700'
                                        }`}
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <Image
                                            src={imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}
                                            alt={`${product.name} - Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Info</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-gray-400 text-sm">ID</dt>
                                <dd className="text-white">{product.id}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-400 text-sm">Price</dt>
                                <dd className="text-white text-xl font-bold">{formatPrice(product.price)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-400 text-sm">Brand</dt>
                                <dd className="text-white">{product.brand}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-400 text-sm">Category</dt>
                                <dd className="text-white">{product.category || "Uncategorized"}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-gray-400 text-sm">URL Path</dt>
                                <dd className="text-white font-mono text-sm bg-gray-700 p-2 rounded mt-1">
                                    /products/{product.url}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    {/* Description */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {product.description?.title || product.name}
                        </h2>

                        {product.description?.overview && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-white mb-2">Overview</h3>
                                <p className="text-gray-300 whitespace-pre-line">
                                    {product.description.overview}
                                </p>
                            </div>
                        )}

                        {product.description?.details && product.description.details.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-white mb-2">Key Details</h3>
                                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                                    {product.description.details.map((detail, index) => (
                                        <li key={index}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Specifications */}
                    {product.description?.specifications &&
                        Object.keys(product.description.specifications).length > 0 && (
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-bold text-white mb-4">Specifications</h2>
                                <div className="divide-y divide-gray-700">
                                    {Object.entries(product.description.specifications).map(([key, value], index) => (
                                        <div key={index} className="py-3 grid grid-cols-2">
                                            <dt className="text-gray-400">{key}</dt>
                                            <dd className="text-white">{value}</dd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Preview Link */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Store Preview</h2>
                        <Link
                            href={`/products/${product.url}`}
                            target="_blank"
                            className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                        >
                            View Product in Store
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}