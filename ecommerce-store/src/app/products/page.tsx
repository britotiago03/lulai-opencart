"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { useProductCache } from "@/hooks/useProductCache";
import { FilterBar } from "@/components/FilterBar";

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [brand, setBrand] = useState("");

    const {
        products,
        categories,
        brands,
        loading,
        isFiltering
    } = useProductCache({ search, category, minPrice, maxPrice, brand });

    // Define state setter actions with appropriate names for serialization
    const setSearchAction = (value: string) => setSearch(value);
    const setCategoryAction = (value: string) => setCategory(value);
    const setMinPriceAction = (value: string) => setMinPrice(value);
    const setMaxPriceAction = (value: string) => setMaxPrice(value);
    const setBrandAction = (value: string) => setBrand(value);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">All Products</h1>

            <FilterBar
                search={search}
                setSearchAction={setSearchAction}
                category={category}
                setCategoryAction={setCategoryAction}
                minPrice={minPrice}
                setMinPriceAction={setMinPriceAction}
                maxPrice={maxPrice}
                setMaxPriceAction={setMaxPriceAction}
                brand={brand}
                setBrandAction={setBrandAction}
                categories={categories}
                brands={brands}
            />

            {loading ? (
                <div className="flex justify-center my-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {isFiltering && (
                        <div className="flex items-center mb-4 text-gray-600">
                            <div className="mr-2 w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
                            Filtering products...
                        </div>
                    )}

                    <div className="mb-4 text-gray-600">
                        Showing {products.length} products
                    </div>

                    <ProductGrid products={products} />
                </>
            )}
        </div>
    );
}