import { GeistSans } from "geist/font/sans";
import { Product, WithContext } from "schema-dts";
import {
    Inter,
    Nunito,
    Baloo_2,
    Comic_Neue,
    Quicksand,
    Fredoka,
    Lora,
    Inter_Tight,
    Borel,
    Silkscreen,
} from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/Footer";
import { fetchGithubStars } from "./actions";
import { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Karla } from "next/font/google";

const karla = Karla({
	subsets: ["latin"],
	variable: "--font-karla",
});

const nunito = Nunito({
    subsets: ["latin", "vietnamese"],
    display: "swap",
    variable: "--font-nunito",
    weight: ["300", "400", "500", "600", "700", "800"],
});

import Script from "next/script";
import { Navbar } from "./components/Nav/Navbar";
import { getUserById } from "@/db/users";

const inter = Inter({
    subsets: ["latin", "vietnamese"],
    display: "swap",
    variable: "--font-inter",
});

const inter_tight = Inter_Tight({
    weight: ["500", "600", "700"],
    style: ["normal", "italic"],
    subsets: ["latin"],
    variable: "--font-inter-tight",
    display: "swap",
});

const baloo2 = Baloo_2({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-baloo2",
});

const comicNeue = Comic_Neue({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-comic-neue",
    weight: ["300", "400", "700"],
});

const quicksand = Quicksand({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-quicksand",
});

const fredoka = Fredoka({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-fredoka",
});

const lora = Lora({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-lora",
});

const borel = Borel({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-borel",
    weight: ["400"],
});

const silkscreen = Silkscreen({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-silkscreen",
    weight: ["400"],
});

const fonts = `${inter.variable} ${nunito.variable} ${inter_tight.variable} ${baloo2.variable} ${comicNeue.variable} ${quicksand.variable} ${fredoka.variable} ${lora.variable} ${karla.variable} ${borel.variable} ${silkscreen.variable}`;

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
    metadataBase: new URL(defaultUrl),
    title: {
        default:
            "Aisha AI: Nền tảng hỗ trợ thị giác AI thời gian thực",
        template:
            "%s | Aisha AI - Nền tảng hỗ trợ thị giác AI",
    },
    applicationName: "Aisha AI",
    description:
        "Aisha là nền tảng hỗ trợ thị giác AI chuyên nghiệp, cung cấp các công cụ hỗ trợ thời gian thực.",
    authors: [
        {
            name: "Aisha Team",
            url: "https://Aishaai.com",
        },
    ],
    keywords: [
        "hỗ trợ thị giác",
        "AI thị giác",
        "công nghệ hỗ trợ",
        "thiết bị hỗ trợ thị giác",
        "AI accessibility",
        "vision assistance",
        "assistive technology",
        "Aisha AI",
        "hỗ trợ người",
        "công nghệ tiếp cận",
        "AI hỗ trợ",
        "thị giác AI",
        "accessibility platform",
        "vision support",
        "assistive AI",
        "inclusive technology",
    ],
    openGraph: {
        title: "Aisha AI: Nền tảng hỗ trợ thị giác AI thời gian thực",
        description:
            "Aisha cung cấp nền tảng hỗ trợ thị giác AI chuyên nghiệp với các công cụ hỗ trợ thời gian thực.",
        siteName: "Aisha AI",
        locale: "vi-VN",
        type: "website",
        images: [
            {
                url: "https://Aishaai.com/images/orange.png",
                width: 1200,
                height: 630,
                alt: "Aisha AI conversational device - Front View",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
    },
    generator: "Next.js",
    creator: "Aisha Team",
    publisher: "Aisha AI Ltd.",
    alternates: {
        canonical: "https://Aishaai.com",
        languages: {
            "vi-VN": "https://Aishaai.com",
            "zh-CN": "https://Aishaai.com",
        },
    },
    icons: {
        icon: "https://Aishaai.com/favicon.ico",
        apple: "https://Aishaai.com/favicon.ico",
    },
    twitter: {
        card: "summary_large_image",
        title: "Aisha - An AI-powered device that brings objects to life through engaging, conversational experiences",
        description:
            "More than a device, Aisha is your gateway to a world where AI brings magic to the ordinary through engaging learning and interactive experiences.",
        images: ["https://Aishaai.com/images/orange.png"],
    },
    assets: "https://Aishaai.com/images",
    formatDetection: {
        telephone: false,
    },
    appleWebApp: {
        capable: true,
        title: "Aisha AI",
        statusBarStyle: "black-translucent",
    },
    category: "AI device",
    classification: "Interactive, conversational AI Devices",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

const jsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Aisha AI",
    description:
        "Aisha is an AI-enabled device that brings objects to life through conversational AI. More than a device, it's your gateway to a world where AI brings magic to the ordinary.",
    brand: {
        "@type": "Brand",
        name: "Aisha AI",
    },
    offers: {
        "@type": "Offer",
        url: "https://Aishaai.com",
        priceCurrency: "USD",
        price: "57.99",
        priceValidUntil: "2024-12-31", // set a realistic date in the future
        availability: "https://schema.org/InStock",
        seller: {
            "@type": "Organization",
            name: "Aisha AI Ltd.",
        },
        hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            returnPolicyCategory:
                "https://schema.org/MerchantReturnUnspecified",
            merchantReturnDays: 30,
        },
        shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: {
                "@type": "DefinedRegion",
                name: "Worldwide", // Reflects availability in all countries
            },
            shippingRate: {
                "@type": "MonetaryAmount",
                value: "0.00",
                currency: "USD", // Free shipping
            },
        },
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "14",
    },
    review: [
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "Kai L.",
            },
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
            },
            reviewBody:
                "I wished to have a toy for my friends kids, chatting just for fun ... and hearing all is 'out-of-the-.box' is a unbelievable awesome",
        },
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "Lauren A. W.",
            },
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
            },
            reviewBody:
                "I want to make a mini me. I think this box will really help!",
        },
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "Steven Z.",
            },
            reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
            },
            reviewBody: "this is fantastic, extremely useful. Thanks so much.",
        },
        {
            "@type": "Review",
            author: {
                "@type": "Person",
                name: "Big cube",
            },
            reviewRating: {
                "@type": "Rating",
                ratingValue: "4.5",
            },
            reviewBody:
                "Really cool project you've got going on, hoping one day it might use a local llm",
        },
    ],
    image: "https://Aishaai.com/images/orange.png",
    category: "Interactive AI Device",
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    const { stars } = await fetchGithubStars("akdeb/AishaAI");

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let dbUser: IUser | undefined;
    if (user) {
        dbUser = await getUserById(supabase, user.id);
    }


    return (
        <html
            lang="en"
            className={`${GeistSans.className} h-full ${fonts}`}
            suppressHydrationWarning
        >
            <head>
                <link rel="canonical" href="https://www.Aishaai.com" />
                <Script
                    id="product-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLd),
                    }}
                />
            </head>
            <body className="bg-background text-foreground flex flex-col min-h-screen font-nunito">
                <a href="#main-content" className="skip-nav">
                    Bỏ qua điều hướng
                </a>
                <NextTopLoader showSpinner={false} color="#003366" />

                {/* <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                > */}
                <main id="main-content" className="flex-grow mx-auto w-full flex flex-col">
                    <Navbar user={dbUser ?? null} stars={stars} />
                    {children}
                    <Footer />
                </main>
                {/* <Analytics /> */}
                <Toaster />
                {/* </ThemeProvider> */}
            </body>
            <GoogleAnalytics gaId="G-CR07NVH6CN" />
        </html>
    );
}
