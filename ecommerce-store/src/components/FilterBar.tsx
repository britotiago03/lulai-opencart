"use client";

import React from 'react';
import { useCallback } from 'react';

interface FilterBarProps {
    search: string;
    setSearchAction: (value: string) => void;
    category: string;
    setCategoryAction: (value: string) => void;
    minPrice: string;
    setMinPriceAction: (value: string) => void;
    maxPrice: string;
    setMaxPriceAction: (value: string) => void;
    brand: string;
    setBrandAction: (value: string) => void;
    categories: string[];
    brands: string[];
}

export function FilterBar({
                              search,
                              setSearchAction,
                              category,
                              setCategoryAction,
                              minPrice,
                              setMinPriceAction,
                              maxPrice,
                              setMaxPriceAction,
                              brand,
                              setBrandAction,
                              categories,
                              brands
                          }: FilterBarProps) {
    // Using callbacks to avoid serialization issues
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchAction(e.target.value);
    }, [setSearchAction]);

    const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryAction(e.target.value);
    }, [setCategoryAction]);

    const handleBrandChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setBrandAction(e.target.value);
    }, [setBrandAction]);

    const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMinPriceAction(e.target.value);
    }, [setMinPriceAction]);

    const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMaxPriceAction(e.target.value);
    }, [setMaxPriceAction]);

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
                className="border p-2 rounded"
            />

            <select
                value={category}
                onChange={handleCategoryChange}
                className="border p-2 rounded"
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <select
                value={brand}
                onChange={handleBrandChange}
                className="border p-2 rounded"
            >
                <option value="">All Brands</option>
                {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                ))}
            </select>

            <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={handleMinPriceChange}
                className="border p-2 rounded w-24"
            />
            <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="border p-2 rounded w-24"
            />
        </div>
    );
}