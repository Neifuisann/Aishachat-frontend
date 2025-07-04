// frontend/app/components/LandingPage/ProductGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const images = [
    {
        src: "/products/device1.jpeg",
        alt: "Aisha Device - white",
    },
    {
        src: "/products/device2.jpeg",
        alt: "Aisha Device - gray",
    },
    {
        src: "/products/device4.jpeg",
        alt: "Aisha Device - white",
    },
    {
        src: "/products/device5.jpeg",
        alt: "Aisha Device - gray",
    },
    {
        src: "/products/device6.jpeg",
        alt: "Aisha Device - black",
    },
    {
        src: "/products/device7.jpeg",
        alt: "Aisha Device - white",
    },
    {
        src: "/products/device8.jpeg",
        alt: "Aisha Device - gray",
    },
];

export default function ProductGallery() {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
            {/* Main Image */}
            <div className="relative w-full h-[400px] rounded-2xl bg-gray-50">
                <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    className="object-contain rounded-2xl"
                    sizes="(max-width: 768px) 100vw, 75vw"
                    priority
                />
            </div>

            {/* Thumbnail Carousel */}
            <div className="w-full px-8">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {images.map((image, index) => (
                            <CarouselItem key={index} className="pl-4 basis-1/5 py-2">
                                <div
                                    className={`relative sm:h-20 h-16 cursor-pointer rounded-lg overflow-hidden ${
                                        selectedImage.src === image.src
                                            ? 'ring-2 ring-yellow-500'
                                            : 'hover:opacity-75'
                                    }`}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 20vw, 15vw"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
}