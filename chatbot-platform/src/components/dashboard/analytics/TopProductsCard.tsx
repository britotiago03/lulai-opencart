"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { ProductItem } from "@/types/analytics";
import { useState, useEffect } from "react";

export default function TopProductsCard({
    products
}: {
    products: ProductItem[] | undefined;
}) {
    const [open, setOpen] = useState(false);
    
    // Debug output to see what's coming in
    useEffect(() => {
        console.log("TopProductsCard products:", products);
    }, [products]);
    
    if (!products || products.length === 0) {
        return (
            <Card className="bg-[#1b2539] border-0">
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Top Products</h3>
                        <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                            {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                        </button>
                    </div>
                    <div className="text-gray-500 text-center py-8 flex flex-col items-center">
                        <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
                        <p>No product data available</p>
                        <p className="text-xs mt-1">Products will appear here when customers add items to cart</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Process products to ensure they have valid names
    const processedProducts = products.map(product => ({
        ...product,
        product_name: product.product_name || (product.product_id ? `Product #${product.product_id}` : 'Unknown Product'),
        count: product.count || 0
    }));

    const max = processedProducts[0]?.count ?? 1;

    return (
        <Card className="bg-[#1b2539] border-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Top Products</h3>
                    <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-white">
                        {open ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                    </button>
                </div>

                <div className="space-y-4">
                    {processedProducts.map((product, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className="w-8 h-8 bg-[#232b3c] rounded-full flex items-center justify-center mr-3 text-sm">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <p className="font-medium truncate" title={product.product_name}>
                                        {product.product_name}
                                    </p>
                                    <p className="text-gray-400 ml-2 flex-shrink-0">{product.count}</p>
                                </div>
                                <div className="w-full bg-[#232b3c] rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${(product.count / max) * 100}%` }}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {open && (
                    <div className="mt-6 border-t border-gray-700 pt-4">
                        <p className="text-sm text-gray-400 mb-2">
                            These products were most frequently added to carts through chatbot interactions.
                        </p>
                        <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                            <li>Track which products perform best through chatbot assistance</li>
                            <li>Monitor product popularity trends over time</li>
                            <li>Identify opportunities for cross-selling related products</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}