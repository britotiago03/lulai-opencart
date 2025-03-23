import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    images: string[];
    url: string;
    description?: {
        title: string;
        overview: string;
        details: string[];
        specifications: Record<string, string>;
    };
}

export function useProduct(productId: string | null) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Skip if no product ID is provided
        if (!productId) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const fetchProduct = async () => {
            try {
                if (!isMounted) return;

                setLoading(true);
                const response = await fetch(`/api/admin/products/${productId}`);

                if (!isMounted) return;

                if (!response.ok) {
                    const errorMessage = `Failed to fetch product: ${response.statusText}`;
                    try {
                        const errorText = await response.text();
                        console.error(`Server error: ${errorText}`);
                    } catch (readError) {
                        console.error("Error reading response text:", readError);
                    }

                    // Instead of throwing an error, we'll handle it directly
                    if (isMounted) {
                        setError(errorMessage);
                        setLoading(false);
                        toast.error("Failed to load product data");
                    }
                    return; // Early return to avoid proceeding
                }

                if (!isMounted) return;

                const data = await response.json();

                if (!isMounted) return;

                // Process images array if it's a string
                if (typeof data.product.images === 'string') {
                    data.product.images = JSON.parse(data.product.images);
                }

                setProduct(data.product);
            } catch (err) {
                if (!isMounted) return;

                console.error("Error fetching product:", err);
                setError(err instanceof Error ? err.message : "Failed to load product data");

                // Only show toast if component is still mounted
                if (isMounted) {
                    toast.error("Failed to load product data");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Call the function and explicitly ignore the promise
        void fetchProduct();

        // Cleanup function to handle unmounting
        return () => {
            isMounted = false;
        };
    }, [productId]);

    return { product, loading, error };
}