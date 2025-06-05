import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SidebarNav } from "../components/Nav/SidebarNavItems";
import { Gamepad2, Plus, Settings, History, StickyNote, BookOpen, Calendar } from "lucide-react";
import { Metadata } from "next";
import { getOpenGraphMetadata } from "@/lib/utils";
import { MobileNav } from "../components/Nav/MobileNav";
import { getUserById } from "@/db/users";

const ICON_SIZE = 20;

export const dynamic = "force-dynamic";
export const revalidate = 60;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
    title: "Home",
    ...getOpenGraphMetadata("Home"),
};

const sidebarNavItems: SidebarNavItem[] = [
    {
        title: "Chế độ",
            href: "/home",
            icon: <Gamepad2 size={ICON_SIZE} />,
        },
        {
            title: "Lịch sử",
            href: "/home/activity",
            icon: <History size={ICON_SIZE} />,
        },
        {
            title: "Ghi chú",
            href: "/home/notes",
            icon: <StickyNote size={ICON_SIZE} />,
        },
        {
            title: "Lịch trình",
            href: "/home/schedule",
            icon: <Calendar size={ICON_SIZE} />,
        },
        {
            title: "Thư viện",
            href: "/home/library",
            icon: <BookOpen size={ICON_SIZE} />,
        },
        {
            title: "Cài Đặt",
            href: "/home/settings",
            icon: <Settings size={ICON_SIZE} />,
        },
        {
            title: "Cấu hình",
            href: "/home/create",
            icon: <Plus size={ICON_SIZE+4} strokeWidth={2.5} />,
            isPrimary: true,
        },
    ];

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const dbUser = await getUserById(supabase, user.id);

    if (!dbUser) {
        redirect("/login");
    }

    const mobileNavItems = [
        sidebarNavItems[0], // Assistance Modes
        sidebarNavItems[1], // Assistance History
        sidebarNavItems[2], // Assistance Notes
        sidebarNavItems[3], // Schedule
        sidebarNavItems[4], // Library
        sidebarNavItems[6], // Configure Assistance
        sidebarNavItems[5], // Settings
    ];

    return (
        <div className="flex flex-1 flex-col mx-auto w-full max-w-[1400px] gap-2 pb-2 md:flex-row">
            <aside className="w-full md:w-[270px] sm:py-4 pt-2 md:overflow-y-auto md:fixed md:h-screen">
                <SidebarNav items={sidebarNavItems} />
            </aside>
            <main className="flex-1 sm:py-4 px-4 flex justify-center md:ml-[270px]">
                <div className="max-w-5xl w-full">{children}</div>
            </main>
            <MobileNav items={mobileNavItems} />
        </div>
    );
}
