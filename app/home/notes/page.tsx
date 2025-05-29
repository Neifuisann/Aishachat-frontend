import { createClient } from "@/utils/supabase/server";
import { getUserById } from "@/db/users";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getOpenGraphMetadata } from "@/lib/utils";
import NotesTab from "@/app/components/Notes/NotesTab";

export const metadata: Metadata = {
    title: "Ghi chú của bạn",
    ...getOpenGraphMetadata("Ghi chú của bạn"),
};

export const revalidate = 0; // disable cache for this route
export const dynamic = "force-dynamic";

export default async function NotesPage() {
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
            <NotesTab currentUser={dbUser} />
        </div>
    );
}
