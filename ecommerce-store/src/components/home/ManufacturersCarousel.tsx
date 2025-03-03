"use client"; // ✅ Required for Swiper to work

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

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

export default function ManufacturersCarousel() {
    return (
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
    );
}
