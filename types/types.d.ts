// types/type.d.ts

declare global {
    interface IInbound {
        inbound_id?: string;
        name: string;
        email: string;
        type: "demo" | "preorder";
    }

    interface SidebarNavItem {
        title: string;
        href: string;
        icon: React.ReactNode;
        isPrimary?: boolean;
    }

    interface ILanguage {
        language_id: string;
        code: string;
        name: string;
        flag: string;
    }

    type ProductColor = "black" | "white" | "gray";

    interface IDevice {
        device_id: string;
        is_reset: boolean;
        is_ota: boolean;
        volume: number;
        mac_address: string;
        user_code: string;
    }

    interface INote {
        note_id: string;
        user_id: string;
        title: string;
        body: string;
        created_at: string;
        updated_at: string;
        image_id?: string | null;
        color?: string;
        is_pinned?: boolean;
    }

    interface ISchedulePattern {
        weekdays?: number[]; // 0-6, Sunday = 0
        skip_days?: number; // For custom patterns
        specific_dates?: string[]; // YYYY-MM-DD format
        end_date?: string; // YYYY-MM-DD format
    }

    interface ISchedule {
        schedule_id: string;
        user_id: string;
        title: string;
        description?: string | null;
        scheduled_time: string; // HH:MM format
        schedule_type: 'once' | 'daily' | 'weekly' | 'custom';
        schedule_pattern?: ISchedulePattern | null;
        target_date?: string | null; // YYYY-MM-DD format for one-time schedules
        is_active: boolean;
        created_at: string;
        updated_at: string;
    }

    interface IScheduleWithCurrentTime extends ISchedule {
        current_time?: string; // Current UTC+7 time for display
        current_date?: string; // Current UTC+7 date
        time_until?: string; // Human readable time until next occurrence
        status?: 'upcoming' | 'passed' | 'today';
    }

    interface IBook {
        book_id: string;
        book_name: string;
        file_path: string;
        total_pages: number;
        is_public: boolean;
        author?: string | null;
        description?: string | null;
        created_at: string;
        file_size?: number;
        file_type?: string;
        uploaded_by?: string;
    }

    interface IReadingHistory {
        history_id: string;
        user_id: string;
        book_name: string;
        current_page: number;
        total_pages: number;
        last_read_at: string;
        created_at: string;
        reading_progress?: number; // calculated field
    }

    interface IReadingSettings {
        settings_id: string;
        user_id: string;
        reading_mode: 'paragraphs' | 'sentences' | 'fullpage';
        reading_amount: number;
        created_at: string;
        updated_at: string;
    }

    interface BookUploadData {
        title: string;
        author?: string;
        description?: string;
        file: File;
        is_public?: boolean;
    }

    interface ReadingContent {
        content: string;
        currentPage: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    }

    interface IUser {
        user_id: string;
        avatar_url: string;
        is_premium: boolean;
        email: string;
        supervisor_name: string;
        supervisee_name: string;
        supervisee_persona: string;
        supervisee_age: number;
        session_time: number;
        user_info: UserInfo;

        // personality
        personality_id: string;
        personality?: IPersonality;

        // language
        language?: ILanguage;
        language_code: string;

        // device
        device?: IDevice;
        device_id: string | null;
    }

    type UserInfo =
        | {
              user_type: "user";
              user_metadata: IUserMetadata;
          }
        | {
              user_type: "doctor";
              user_metadata: IDoctorMetadata;
          }
        | {
              user_type: "business";
              user_metadata: IBusinessMetadata;
          };

    interface IBusinessMetadata {}

    interface IDoctorMetadata {
        doctor_name: string;
        specialization: string;
        hospital_name: string;
        favorite_phrases: string;
        hospital_layout: string;
    }

    interface IUserMetadata {}

    type Role = "user" | "assistant" | "doctor";

    interface IConversation {
        conversation_id?: string;
        created_at?: string;
        personality_key: string;
        user_id: string;
        role: Role;
        content: string;
        metadata: any;
        chat_group_id: string | null;
        is_sensitive: boolean;
    }

    type TTSModel = "FISH" | "AZURE";

    type OaiVoice = 'ash' | 'alloy' | 'echo' | 'shimmer' | 'ballad' | 'coral' | 'sage' | 'verse';

    // characters <-> personalities table
    interface IPersonality {
        personality_id?: string;
        is_doctor: boolean;
        is_child_voice: boolean;
        is_story: boolean;
        key: string;
        oai_voice: OaiVoice;
        title: string;
        subtitle: string;
        short_description: string;
        character_prompt: string;
        voice_prompt: string;
        creator_id: string | null;
        pitch_factor: number;
    }

    type PersonalityFilter = "is_child_voice" | "is_doctor" | "is_story";

    type Module = "math" | "science" | "spelling" | "general_trivia";

    type PieChartData = {
        id: string;
        label: string;
        value: number | null;
    };

    interface DataPoint {
        x: string;
        y: number;
    }

    interface HeatMapData {
        id: string;
        data: DataPoint[];
    }

    interface LineChartData {
        id: any;
        name: string;
        data: any;
    }

    interface ProcessedData {
        cardData: CardData | null;
        barData: BarData[];
        lineData: LineData[];
        pieData: PieData[];
        suggestions: string | undefined;
    }

    interface CardData {
        [key: string]: {
            title: string;
            value: number;
            change: number | null;
        };
    }

    interface BarData {
        emotion: string;
        [key: string]: number | string;
    }

    interface LineData {
        id: string;
        name: string;
        data: { x: string; y: number | null }[];
    }

    interface PieData {
        id: string;
        label: string;
        value: number | null;
    }

    interface LastJsonMessageType {
        type: string;
        audio_data: string | null;
        text_data: string | null;
        boundary: string | null;
        task_id: string;
    }

    export interface MessageHistoryType {
        type: string;
        text_data: string | null;
        task_id: string;
    }
}

export {}; // This is necessary to make this file a module and avoid TypeScript errors.
