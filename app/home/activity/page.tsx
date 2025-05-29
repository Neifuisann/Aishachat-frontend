import { createClient } from "@/utils/supabase/server";
import { getUserById } from "@/db/users";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getOpenGraphMetadata } from "@/lib/utils";
import ActivityHistoryTab from "@/app/components/ActivityHistory/ActivityHistoryTab";

export const metadata: Metadata = {
    title: "Lịch sử hoạt động",
    ...getOpenGraphMetadata("Lịch sử hoạt động"),
};

export const revalidate = 0; // disable cache for this route
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
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

    return (
        <div className="pb-4 flex flex-col gap-2">
            <ActivityHistoryTab currentUser={dbUser} />
        </div>
    );
}
