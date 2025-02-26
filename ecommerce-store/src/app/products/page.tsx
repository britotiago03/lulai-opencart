"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [brand, setBrand] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            const queryParams = new URLSearchParams();

            if (search) queryParams.append("search", search);
            if (category) queryParams.append("category", category);
            if (minPrice) queryParams.append("minPrice", minPrice);
            if (maxPrice) queryParams.append("maxPrice", maxPrice);
            if (brand) queryParams.append("brand", brand);

            const res = await fetch(`/api/products?${queryParams.toString()}`);
            const data = await res.json();
            setProducts(data);
        };

        fetchProducts();
    }, [search, category, minPrice, maxPrice, brand]);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Categories</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Computers">Computers</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                </select>

                <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Brands</option>
                    <option value="Apple">Apple</option>
                    <option value="Canon">Canon</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Sony">Sony</option>
                    <option value="Nikon">Nikon</option>
                </select>

                <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border p-2 rounded w-24"
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border p-2 rounded w-24"
                />
            </div>

            {/* Product List */}
            <ProductGrid products={products} />
        </div>
    );
}
