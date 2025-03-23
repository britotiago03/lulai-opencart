"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAdminEvents } from "@/hooks/admin/useAdminEvents";
import ProductTable from "@/components/admin/ProductTable";
import { toast } from "react-hot-toast";

interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    images: string[];
    url: string;
}

interface PaginationData {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
}

interface ProductApiResponse {
    products: ProductApiItem[];
    pagination: PaginationData;
}

interface ProductApiItem {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    images: string | string[];
    url: string;
    [key: string]: string | number | boolean | string[] | null | undefined; // For any other properties that might be in the API response
}

export default function ProductsPage() {
    // Using session for authentication but not directly in the component
    useSession({ required: true });

    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        page: 1,
        limit: 10,
        totalProducts: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [brand, setBrand] = useState("");
    const [sort, setSort] = useState("name");
    const [order, setOrder] = useState("asc");
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

    // Function to fetch products with filters
    const fetchProducts = useCallback(async (page = 1) => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', pagination.limit.toString());
            params.append('sort', sort);
            params.append('order', order);

            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (brand) params.append('brand', brand);

            const response = await fetch(`/api/admin/products?${params.toString()}`);

            if (!response.ok) {
                const errorText = await response.text();
                setError(`Error fetching products: ${response.statusText}. ${errorText}`);
                return;
            }

            const data = await response.json() as ProductApiResponse;

            // Process product images
            const processedProducts = data.products.map((product: ProductApiItem) => ({
                ...product,
                images: typeof product.images === 'string'
                    ? JSON.parse(product.images)
                    : product.images
            }));

            setProducts(processedProducts);
            setPagination(data.pagination);

            // Extract unique categories and brands for filters
            const allCategories = new Set<string>();
            const allBrands = new Set<string>();

            processedProducts.forEach((product: Product) => {
                if (product.category) allCategories.add(product.category);
                if (product.brand) allBrands.add(product.brand);
            });

            setCategories(Array.from(allCategories).sort());
            setBrands(Array.from(allBrands).sort());

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit, sort, order, search, category, brand]);

    // Initial data fetch
    useEffect(() => {
        void fetchProducts(1);
    }, [fetchProducts]);

    // Handle product update events
    const { connected } = useAdminEvents({
        onProductUpdated: (productData) => {
            toast.success(`Product "${productData.name}" was updated`, {
                position: 'top-right',
                duration: 3000
            });

            // Refresh the product list
            void fetchProducts(pagination.page);
        }
    });

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            void fetchProducts(newPage);
        }
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        void fetchProducts(1); // Reset to first page when searching
    };

    // Handle filter reset
    const handleReset = () => {
        setSearch("");
        setCategory("");
        setBrand("");
        setSort("name");
        setOrder("asc");
        void fetchProducts(1);
    };

    // Handle product selection
    const handleProductSelect = (id: number, selected: boolean) => {
        if (selected) {
            setSelectedProducts([...selectedProducts, id]);
        } else {
            setSelectedProducts(selectedProducts.filter(productId => productId !== id));
        }
    };

    // Handle bulk selection
    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedProducts(products.map(product => product.id));
        } else {
            setSelectedProducts([]);
        }
    };

    // Handle product deletion
    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to delete product");
                return;
            }

            toast.success("Product deleted successfully");

            // Remove from selected products
            setSelectedProducts(selectedProducts.filter(productId => productId !== id));

            // Refresh the product list
            await fetchProducts(pagination.page);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error deleting product");
            console.error("Error deleting product:", error);
        }
    };

    // Handle bulk deletion
    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) {
            toast.error("No products selected");
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            let successCount = 0;
            let failCount = 0;

            // Delete products one by one
            for (const id of selectedProducts) {
                const response = await fetch(`/api/admin/products/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            // Show result toast
            if (successCount > 0 && failCount === 0) {
                toast.success(`Successfully deleted ${successCount} product(s)`);
            } else if (successCount > 0 && failCount > 0) {
                toast.error(`Deleted ${successCount} product(s), but failed to delete ${failCount} product(s)`);
            } else {
                toast.error(`Failed to delete any products`);
            }

            // Refresh the product list and clear selection
            setSelectedProducts([]);
            await fetchProducts(pagination.page);

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error deleting products");
            console.error("Error in bulk delete:", error);
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Products</h1>

                <div className="flex items-center space-x-2">
                    {/* Real-time connection indicator */}
                    <div className="flex items-center mr-4">
                        <span className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-gray-400">
                            {connected ? 'Live updates' : 'Connecting...'}
                        </span>
                    </div>

                    <Link
                        href={`/admin/products/new`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Add New Product
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-800 text-white p-4 rounded-md">
                    <p>{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="bg-gray-800 p-4 rounded-lg shadow">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                                Category
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                                Brand
                            </label>
                            <select
                                id="brand"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                                <option value="">All Brands</option>
                                {brands.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium text-gray-300 mb-1">
                                Sort By
                            </label>
                            <div className="flex">
                                <select
                                    id="sort"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white"
                                >
                                    <option value="name">Name</option>
                                    <option value="price">Price</option>
                                    <option value="brand">Brand</option>
                                    <option value="category">Category</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                                    className="px-3 py-2 bg-gray-600 border border-gray-600 rounded-r-md text-white"
                                >
                                    {order === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                        >
                            Reset Filters
                        </button>

                        <div className="space-x-3">
                            {selectedProducts.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Delete Selected ({selectedProducts.length})
                                </button>
                            )}

                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Products Table */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <ProductTable
                    products={products}
                    selectedProducts={selectedProducts}
                    onSelectProduct={handleProductSelect}
                    onSelectAll={handleSelectAll}
                    onDeleteProduct={handleDeleteProduct}
                />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-700 flex justify-between items-center">
                        <div>
                            <span className="text-sm text-gray-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalProducts)} of {pagination.totalProducts} products
                            </span>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className={`px-3 py-1 rounded-md ${
                                    pagination.page === 1
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-600 text-white hover:bg-gray-500'
                                }`}
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                // Calculate page numbers to show (current and surrounding pages)
                                const pageOffset = Math.min(Math.max(0, pagination.page - 3), Math.max(0, pagination.totalPages - 5));
                                const pageNum = i + 1 + pageOffset;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 rounded-md ${
                                            pagination.page === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-600 text-white hover:bg-gray-500'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className={`px-3 py-1 rounded-md ${
                                    pagination.page === pagination.totalPages
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-600 text-white hover:bg-gray-500'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}