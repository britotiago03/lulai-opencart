"use client";

import React from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { useProduct } from "@/hooks/useProduct";

export default function EditProductPage() {
    const params = useParams();
    const productId = params?.id as string;

    const { product, loading, error } = useProduct(productId);

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
                <h1 className="text-2xl font-bold text-white">Edit Product: {product.name}</h1>
            </div>

            <ProductForm
                initialData={product}
                isEditing={true}
            />
        </div>
    );
}