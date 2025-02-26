"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
}

export default function Home() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products");
                if (!res.ok) {
                    console.error("Failed to fetch products:", res.statusText);
                    return;
                }
                const data: Product[] = await res.json();
                setProducts(data.slice(0, 4)); // Show only 4 featured products
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts().catch((err) => console.error("Unhandled error:", err));
    }, []);

    const banners = [
        "/images/banners/iphone_banner.jpg",
        "/images/banners/macbook_air_banner.jpg",
    ];

    const manufacturers = [
        "/images/manufacturers/burgerking.png",
        "/images/manufacturers/canon.png",
        "/images/manufacturers/cocacola.png",
        "/images/manufacturers/dell.png",
        "/images/manufacturers/disney.png",
        "/images/manufacturers/harley.png",
        "/images/manufacturers/nfl.png",
        "/images/manufacturers/nintendo.png",
        "/images/manufacturers/redbull.png",
        "/images/manufacturers/shell.png",
        "/images/manufacturers/sony.png",
        "/images/manufacturers/starbucks.png",
    ];

    return (
        <div className="container mx-auto p-8">
            {/* Welcome Message */}
            <section className="text-center mb-8">
                <h1 className="text-3xl font-bold">Welcome to Our Store</h1>
                {session ? (
                    <p className="text-lg">Hello, <strong>{session.user?.name}</strong>! 🎉</p>
                ) : (
                    <p className="text-lg">
                        You are not logged in.{" "}
                        <Link href="/auth/login" className="text-blue-500 underline">
                            Log in here
                        </Link>.
                    </p>
                )}
            </section>

            {/* 🔹 Banner Carousel */}
            <section className="mb-8">
                <div className="max-w-screen-lg mx-auto relative">
                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        autoplay={{ delay: 4000 }}
                        pagination={{ clickable: true }}
                        navigation
                        loop
                        className="w-full"
                    >
                        {banners.map((banner, index) => (
                            <SwiperSlide key={index} className="flex justify-center">
                                <Image
                                    src={banner}
                                    alt={`Banner ${index + 1}`}
                                    width={1000}
                                    height={400}
                                    className="rounded-lg object-cover"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

            {/* 🔹 Featured Products */}
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
                                        layout="fill"
                                        objectFit="contain"
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

            {/* 🔹 Manufacturers Carousel */}
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-center">Our Partners</h2>
                <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 2500 }}
                    loop
                    slidesPerView={4}
                    spaceBetween={20}
                    breakpoints={{
                        640: { slidesPerView: 3 },
                        768: { slidesPerView: 4 },
                        1024: { slidesPerView: 6 },
                    }}
                    className="w-full"
                >
                    {manufacturers.map((logo, index) => (
                        <SwiperSlide key={index} className="flex justify-center">
                            <Image src={logo} alt="Manufacturer logo" width={100} height={100} className="object-contain" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>
        </div>
    );
}
