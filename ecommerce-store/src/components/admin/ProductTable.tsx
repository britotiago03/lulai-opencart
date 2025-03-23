import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    images: string[];
    url: string;
}

interface ProductTableProps {
    products: Product[];
    selectedProducts: number[];
    onSelectProduct: (id: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onDeleteProduct: (id: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
                                                       products,
                                                       selectedProducts,
                                                       onSelectProduct,
                                                       onSelectAll,
                                                       onDeleteProduct
                                                   }) => {
    // Function to format price
    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    // Function to truncate text
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    // Check if all products are selected
    const allSelected = products.length > 0 && selectedProducts.length === products.length;

    if (products.length === 0) {
        return (
            <div className="px-6 py-8 text-center text-gray-400">
                No products found. Try adjusting your filters or add a new product.
            </div>
        );
    }

    return (
        <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => onSelectAll(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                </th>
            </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
            {products.map((product) => {
                const isSelected = selectedProducts.includes(product.id);

                return (
                    <tr
                        key={product.id}
                        className={`transition-colors ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-750'}`}
                    >
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 mr-4 relative overflow-hidden rounded-md">
                                    {product.images && product.images.length > 0 ? (
                                        <Image
                                            src={product.images[0].startsWith('/')
                                                ? product.images[0]
                                                : `/${product.images[0]}`}
                                            alt={product.name}
                                            width={48}
                                            height={48}
                                            className="h-12 w-12 object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-600 flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="hover:text-blue-400"
                                        >
                                            {truncateText(product.name, 40)}
                                        </Link>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        ID: {product.id}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {product.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <div className="flex space-x-3 justify-end">
                                <Link
                                    href={`/admin/products/${product.id}/edit`}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => onDeleteProduct(product.id)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
};

export default ProductTable;