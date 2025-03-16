import { getProducts } from "@/lib/products"; // Fetch at build time
import Link from "next/link";
import Image from "next/image";
import SwiperBanner from "@/components/home/SwiperBanner"; // ✅ Import Swiper client component
import ManufacturersCarousel from "@/components/home/ManufacturersCarousel"; // ✅ Import manufacturers carousel client component

export default async function Home() {
    // ✅ Pre-fetch products at build time (SSG)
    const products = await getProducts();

    return (
        <div className="container mx-auto p-8">
            {/* 🔹 Welcome Message */}
            <section className="text-center mb-8">
                <h1 className="text-3xl font-bold">Welcome to Our Store</h1>
                <p className="text-lg">Find the best deals on top-quality products!</p>
            </section>

            {/* 🔹 Banner Carousel (Client Component) */}
            <section className="mb-8">
                <div className="max-w-screen-lg mx-auto relative">
                    <SwiperBanner /> {/* ✅ Swiper runs separately on the client */}
                </div>
            </section>

            {/* 🔹 Featured Products (SSG) */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link key={product.id} href={`/product/${product.id}`} className="group">
                            <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center text-center">
                                {/* ✅ Fixed Image Sizes */}
                                <div className="relative w-[200px] h-[200px]">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        width={200}
                                        height={200}
                                        className="rounded-lg bg-white"
                                    />
                                </div>

                                <h3 className="text-sm font-semibold text-center mt-2">{product.name}</h3>
                                <p className="text-center text-gray-600 text-sm">${product.price.toFixed(2)}</p>

                                {/* ✅ Clickable Hover Effect */}
                                <div className="opacity-0 group-hover:opacity-100 transition duration-300 mt-2">
                                    <span className="text-blue-500 underline">View Product →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 🔹 Manufacturers Carousel (Client Component) */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-center">Our Partners</h2>
                <div className="max-w-screen-lg mx-auto">
                    <ManufacturersCarousel /> {/* ✅ Manufacturers carousel runs on client */}
                </div>
            </section>
        </div>
    );
}
