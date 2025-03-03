// types/product.ts

export interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    images: string[];
    description_file: string;
    category: string;
}

/* Description interface is used in ProductGrid.tsx for product details.
   It's exported here for consistent type definitions across components. */
export interface Description {
    title: string;
    overview: string;
    details: string[];
    specifications: Record<string, string>;
}