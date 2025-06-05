import { createClient } from "@/utils/supabase/server";
import { getUserById } from "@/db/users";
import { redirect } from "next/navigation";
import LibraryTab from "../../components/Library/LibraryTab";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LibraryPage() {
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
        <div className="flex flex-col gap-6">
            <LibraryTab currentUser={dbUser} />
        </div>
    );
}
