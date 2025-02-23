"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
        };
        fetchProducts();
    }, []);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>
            <ProductGrid products={products} />
        </div>
    );
}
