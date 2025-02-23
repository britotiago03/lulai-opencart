import Image from "next/image";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number | null;
    image_url: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const price = product.price !== null ? Number(product.price) : 0;

    return (
        <div className="border rounded-lg p-4 shadow-md bg-white">
            <Image
                src={product.image_url || "/images/products/default.jpg"} // Local fallback
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-48 object-cover mb-4"
            />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">${price.toFixed(2)}</p>
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add to Cart
            </button>
        </div>
    );
}
