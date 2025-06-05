import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserById } from "@/db/users";
import ScheduleTab from "@/app/components/Schedule/ScheduleTab";

export default async function SchedulePage() {
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

    return <ScheduleTab currentUser={dbUser} />;
}
