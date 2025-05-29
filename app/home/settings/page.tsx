import SettingsDashboard from "@/app/components/Settings/SettingsDashboard";
import { getAllLanguages } from "@/db/languages";
import { getUserById } from "@/db/users";
import { getOpenGraphMetadata } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
    ...getOpenGraphMetadata("Settings"),
};

export default async function Home() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const dbUser = user ? await getUserById(supabase, user.id) : null;
    const allLanguagesFromDB = await getAllLanguages(supabase);

    // Filter to only include English and Vietnamese, with Vietnamese as default
    const filteredLanguages: ILanguage[] = [
        {
            language_id: "vi-VN-id",
            code: "vi-VN",
            name: "Tiếng Việt",
            flag: "🇻🇳"
        },
        {
            language_id: "en-US-id",
            code: "en-US",
            name: "English",
            flag: "🇺🇸"
        }
    ];

    // Set default language to Vietnamese if user doesn't have a language set
    let userWithDefaultLanguage = dbUser;
    if (dbUser && (!dbUser.language_code || dbUser.language_code === "")) {
        userWithDefaultLanguage = {
            ...dbUser,
            language_code: "vi-VN"
        };
    }

    return (
        <div className="pb-4 flex flex-col gap-2">
            {userWithDefaultLanguage && (
                <SettingsDashboard
                    selectedUser={userWithDefaultLanguage}
                    allLanguages={filteredLanguages}
                />
            )}
        </div>
    );
}
