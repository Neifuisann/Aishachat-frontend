export const defaultToyId: string = "56224f7f-250d-4351-84ee-e4a13b881c7b";
export const defaultPersonalityId: string =
    "a1c073e6-653d-40cf-acc1-891331689409";

export const paymentLink = "https://buy.stripe.com/bIY0033Dc7LB28o9AJ";
export const discordInviteLink = "https://discord.gg/KJWxDPBRUj";
export const tiktokLink = "https://www.tiktok.com/@Aishaai";
export const githubPublicLink = "https://github.com/akdeb/AishaAI";
export const businessDemoLink = "https://calendly.com/akadeb/Aisha-ai-demo";
export const feedbackFormLink = "https://forms.gle/addformhere";

export const r2Url = "https://pub-cd736d767add4fecafea55c239c28497.r2.dev";
export const r2UrlAudio = "https://pub-5fab8e2596c544cd8dc3e20812be2168.r2.dev";

export const videoSrc = `${r2Url}/IMG_1673.mov`;
export const videoSrc2 = `${r2Url}/IMG_1675.mov`;
export const videoSrc3 = `${r2Url}/IMG_1676.mov`;
export const videoSrc4 = `${r2Url}/IMG_1677.mov`;

export const voiceSampleUrl =
    "https://xygbupeczfhwamhqnucy.supabase.co/storage/v1/object/public/voices/";

export const userFormPersonaLabel =
    "Briefly describe yourself and your interests, personality, and learning style";
export const userFormPersonaPlaceholder =
    "Đừng bắt tôi ăn ớt!";
export const userFormAgeLabel = "Tuổi của bạn";
export const userFormAgeDescription =
    "Người dùng dưới 13 tuổi phải có cha mẹ hoặc người giám hộ để thiết lập Aisha.";
export const userFormNameLabel = "Tên của bạn";

export const INITIAL_CREDITS = 50;
export const SECONDS_PER_CREDIT = (30 * 60) / INITIAL_CREDITS; // 30 minutes equals 50 credits

export const DEVICE_COST = 55;
export const ORIGINAL_COST = 111;
export const SUBSCRIPTION_COST = 10;

export const voices = [
    {
        id: "alloy",
        name: "Alloy",
        description: "Trung lập và cân bằng",
        color: "bg-blue-100",
        emoji: "🧑",
    },
    {
        id: "echo",
        name: "Echo",
        description: "Ấm áp và hài hước",
        color: "bg-purple-100",
        emoji: "👩‍🎤",
    },
    {
        id: "shimmer",
        name: "Shimmer",
        description: "Rõ ràng và cao",
        color: "bg-cyan-100",
        emoji: "👱‍♀️",
    },
    {
        id: "ash",
        name: "Ash",
        description: "Mềm mại và trưởng thành",
        color: "bg-gray-100",
        emoji: "🧔",
    },
    {
        id: "ballad",
        name: "Ballad",
        description: "Hài hước và cảm động",
        color: "bg-indigo-100",
        emoji: "🎭",
    },
    {
        id: "coral",
        name: "Coral",
        description: "Ấm áp và thân thiện",
        color: "bg-orange-100",
        emoji: "👩",
    },
    {
        id: "sage",
        name: "Sage",
        description: "Thông thái và cân bằng",
        color: "bg-green-100",
        emoji: "🧓",
    },
    {
        id: "verse",
        name: "Verse",
        description: "Thơ mộng và cảm động",
        color: "bg-rose-100",
        emoji: "👨‍🎨",
    },
];

export const emotionOptions = [
    { value: "neutral", label: "Trung lập", icon: "😐", color: "bg-red-100" },
    {
        value: "cheerful",
        label: "Vui vẻ",
        icon: "😊",
        color: "bg-yellow-100",
    },
    { value: "serious", label: "Nghiêm túc", icon: "🧐", color: "bg-blue-100" },
    { value: "calm", label: "Lặng lẽ", icon: "😌", color: "bg-teal-100" },
    { value: "excited", label: "Hào hứng", icon: "😃", color: "bg-orange-100" },
    {
        value: "professional",
        label: "Chuyên nghiệp",
        icon: "👔",
        color: "bg-green-100",
    },
];
