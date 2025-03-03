"use client";

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Product } from '@/types/product';

interface FilterOptions {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    brand: string;
}

export function useProductCache({
                                    search,
                                    category,
                                    minPrice,
                                    maxPrice,
                                    brand
                                }: FilterOptions) {
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);

    // Debounce filter values to prevent excessive API calls
    const debouncedSearch = useDebounce(search, 300);
    const debouncedCategory = useDebounce(category, 300);
    const debouncedMinPrice = useDebounce(minPrice, 300);
    const debouncedMaxPrice = useDebounce(maxPrice, 300);
    const debouncedBrand = useDebounce(brand, 300);

    // Initial data load with caching
    useEffect(() => {
        const fetchInitialProducts = async () => {
            setLoading(true);

            try {
                // Try to get from cache first
                const cachedData = localStorage.getItem('products_cache');
                const cacheTimestamp = localStorage.getItem('products_cache_timestamp');

                // Check if cache is valid (less than 1 hour old)
                const isCacheValid = cacheTimestamp &&
                    (Date.now() - parseInt(cacheTimestamp)) < 3600000;

                if (cachedData && isCacheValid) {
                    const parsedData = JSON.parse(cachedData);
                    setProducts(parsedData.products);
                    setAllProducts(parsedData.products);

                    // Type safety for arrays
                    const safeCategories = Array.isArray(parsedData.categories)
                        ? parsedData.categories.filter((cat: unknown) => typeof cat === 'string')
                        : [];

                    const safeBrands = Array.isArray(parsedData.brands)
                        ? parsedData.brands.filter((brand: unknown) => typeof brand === 'string')
                        : [];

                    setCategories(safeCategories);
                    setBrands(safeBrands);
                    setLoading(false);
                    return;
                }

                // If no valid cache, fetch from API
                const res = await fetch('/api/products');
                const productsData = await res.json();

                if (!Array.isArray(productsData)) {
                    console.error('Expected products data to be an array');
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // Extract unique categories and brands with type safety
                const uniqueCategories = [...new Set(productsData
                    .map((p: Product) => p.category)
                    .filter(Boolean))]
                    .sort();

                const uniqueBrands = [...new Set(productsData
                    .map((p: Product) => p.brand)
                    .filter(Boolean))]
                    .sort();

                // Update state
                setProducts(productsData);
                setAllProducts(productsData);
                setCategories(uniqueCategories);
                setBrands(uniqueBrands);

                // Store in cache
                localStorage.setItem('products_cache', JSON.stringify({
                    products: productsData,
                    categories: uniqueCategories,
                    brands: uniqueBrands
                }));
                localStorage.setItem('products_cache_timestamp', Date.now().toString());
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        // Execute the function
        void fetchInitialProducts();
    }, []);

    // Handle filtering
    useEffect(() => {
        if (allProducts.length === 0) return;

        // Check if any filters are active
        const hasActiveFilters = Boolean(
            debouncedSearch ||
            debouncedCategory ||
            debouncedMinPrice ||
            debouncedMaxPrice ||
            debouncedBrand
        );

        if (!hasActiveFilters) {
            setProducts(allProducts);
            return;
        }

        // Determine if we need complex filtering from the API
        const needsComplexFiltering =
            (debouncedSearch && debouncedSearch.length > 2) ||
            (debouncedCategory && debouncedMinPrice) ||
            (debouncedBrand && debouncedMaxPrice) ||
            (debouncedCategory && debouncedBrand);

        // Process client-side or use API based on filter complexity
        if (!needsComplexFiltering) {
            // Simple filtering - do it client-side
            const filtered = allProducts.filter(product => {
                // Apply search, category, and brand filters
                if (debouncedSearch && !product.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
                if (debouncedCategory && product.category !== debouncedCategory) return false;
                if (debouncedBrand && product.brand !== debouncedBrand) return false;

                // Apply price filters (simplified as suggested by linter)
                if (debouncedMinPrice && product.price < parseFloat(debouncedMinPrice)) return false;
                return !(debouncedMaxPrice && product.price > parseFloat(debouncedMaxPrice));
            });

            setProducts(filtered);
            return;
        }

        // Complex filtering via API
        setIsFiltering(true);

        // Check if we have this exact search cached
        const cacheKey = `filter_${debouncedSearch}_${debouncedCategory}_${debouncedMinPrice}_${debouncedMaxPrice}_${debouncedBrand}`;
        const cachedResults = sessionStorage.getItem(cacheKey);

        if (cachedResults) {
            try {
                const parsedResults = JSON.parse(cachedResults);
                setProducts(parsedResults);
            } catch (error) {
                console.error("Error parsing cached results:", error);
            }
            setIsFiltering(false);
            return;
        }

        // Fetch filtered results from API
        const fetchFilteredProducts = async () => {
            const queryParams = new URLSearchParams();

            if (debouncedSearch) queryParams.append("search", debouncedSearch);
            if (debouncedCategory) queryParams.append("category", debouncedCategory);
            if (debouncedMinPrice) queryParams.append("minPrice", debouncedMinPrice);
            if (debouncedMaxPrice) queryParams.append("maxPrice", debouncedMaxPrice);
            if (debouncedBrand) queryParams.append("brand", debouncedBrand);

            try {
                const res = await fetch(`/api/products?${queryParams.toString()}`);
                const data = await res.json();
                setProducts(data);

                // Cache this search result in session storage
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (error) {
                console.error("Error fetching filtered products:", error);
            } finally {
                setIsFiltering(false);
            }
        };

        // Execute the function
        void fetchFilteredProducts();
    }, [
        debouncedSearch,
        debouncedCategory,
        debouncedMinPrice,
        debouncedMaxPrice,
        debouncedBrand,
        allProducts
    ]);

    return {
        products,
        categories,
        brands,
        loading,
        isFiltering
    };
}