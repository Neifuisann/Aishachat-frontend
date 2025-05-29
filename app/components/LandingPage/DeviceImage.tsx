"use client";

import { motion } from "framer-motion"; // Add this import at the top
import Image from "next/image";

export const DeviceImage = () => {
    return (
        <div className="relative h-[260px] w-full items-center -mt-8">
            <motion.div
                animate={{
                    y: [-5, 5, -5],
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                className="w-full h-full"
            >
                <Image
                    src="/products/box43.png"
                    alt="Aisha Toy"
                    fill
                    className="object-contain object-center mr-6 rounded-3xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </motion.div>
        </div>
    );
};

export default DeviceImage;
