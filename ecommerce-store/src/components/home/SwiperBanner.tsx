"use client"; // ✅ Swiper requires client-side rendering

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function SwiperBanner() {
    const banners = [
        "/images/banners/iphone_banner.jpg",
        "/images/banners/macbook_air_banner.jpg",
    ];

    return (
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
    );
}
