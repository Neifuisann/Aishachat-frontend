import {
    Mail,
    Menu,
    CalendarCheck,
    Star,
    Box,
    LogIn,
    HomeIcon,
    Hospital,
    BookOpen,
    Blocks,
    Gamepad2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { User } from "@supabase/supabase-js";
import {
    discordInviteLink,
    feedbackFormLink,
    githubPublicLink,
} from "@/lib/data";
import PremiumBadge from "../PremiumBadge";
import { useEffect, useState } from "react";
import { isPremiumUser } from "@/app/actions";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { usePathname } from "next/navigation";
interface NavbarMenuButtonProps {
    user: IUser | null;
    stars: number | null;
}
const ICON_SIZE = 22;

export function NavbarDropdownMenu({ user, stars }: NavbarMenuButtonProps) {
    const [premiumUser, setPremiumUser] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const setUserPremium = async () => {
            if (user) {
                const isPremium = await isPremiumUser(user.user_id);
                setPremiumUser(isPremium ?? false);
            }
        };
        setUserPremium();
    }, [user]);

    const LoggedInItems: React.FC = () => {
        return (
            <DropdownMenuItem>
                <Link
                    href="/home"
                    passHref
                    className="flex flex-row gap-2 w-full"
                >
                    <HomeIcon size={ICON_SIZE} />
                    <span>Trang chủ</span>
                </Link>
            </DropdownMenuItem>
        );
    };

    const LoggedOutItems: React.FC = () => {
        return (
            <DropdownMenuItem>
                <Link
                    href="/login"
                    passHref
                    className="flex flex-row gap-2 w-full"
                >
                    <LogIn size={ICON_SIZE} />
                    <span>Đăng nhập</span>
                </Link>
            </DropdownMenuItem>
        );
    };

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (!open) {
                    // Remove focus from any active element when dropdown closes
                    document.activeElement instanceof HTMLElement &&
                        document.activeElement.blur();
                }
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex flex-row gap-2 items-center rounded-full 
                    focus:outline-none focus:ring-0 focus:ring-transparent 
                    focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent 
                    shadow-none focus:shadow-none focus-visible:shadow-none"                    >
                    <Menu size={20} />
                    <span className="hidden sm:flex font-normal">
                        {user ? "Trang chủ" : "Đăng nhập"}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 p-2 sm:mt-2 rounded-lg"
                side="bottom"
                align="end"
            >
                {!!user && premiumUser ? (
                    <DropdownMenuLabel className="flex w-full justify-center">
                        <PremiumBadge currentUserId={user.user_id} displayText />
                    </DropdownMenuLabel>
                ) : null}
                <DropdownMenuGroup>
                    {user ? <LoggedInItems /> : <LoggedOutItems />}
                    <DropdownMenuSeparator />
                </DropdownMenuGroup>
                <DropdownMenuItem>
                    <Link
                        href={feedbackFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-row items-center gap-2 w-full"
                    >
                        <Mail size={ICON_SIZE - 2} />
                        <span>Gửi phản hồi</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
