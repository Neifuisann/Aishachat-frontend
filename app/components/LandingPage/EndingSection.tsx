"use client";

import Illustration from "@/public/hero_section.svg";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Star } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import Link from "next/link";
import {
    businessDemoLink,
    discordInviteLink,
    githubPublicLink,
} from "@/lib/data";
import PreorderButton from "../PreorderButton";

export default function EndingSection() {
    return (
        <section className="py-8  md:py-24">
            <div className="max-w-4xl text-center mx-8 md:mx-auto gap-10 flex flex-col">
                <h1
                    className="font-normal text-xl text-gray-600"
                >
                    Bringing creative, personalized stories to toys, plushies and a whole lot
                    more.
                </h1>

                <h1 className="text-4xl md:text-5xl mt-8 text-light">
                    Get your <span className="font-silkscreen font-bold mt-1 px-2">Aisha</span> today!
                </h1>
            </div>
        </section>
    );
}   
