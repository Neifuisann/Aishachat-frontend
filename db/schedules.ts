import { type SupabaseClient } from "@supabase/supabase-js";

export interface CreateScheduleData {
    title: string;
    description?: string;
    scheduled_time: string; // HH:MM format
    schedule_type: 'once' | 'daily' | 'weekly' | 'custom';
    schedule_pattern?: ISchedulePattern | null;
    target_date?: string | null; // YYYY-MM-DD format for one-time schedules
}

export interface UpdateScheduleData {
    title?: string;
    description?: string;
    scheduled_time?: string;
    schedule_type?: 'once' | 'daily' | 'weekly' | 'custom';
    schedule_pattern?: ISchedulePattern | null;
    target_date?: string | null;
    is_active?: boolean;
}

export type ScheduleSortOption = "newest" | "oldest" | "time_asc" | "time_desc" | "title_asc" | "title_desc";

/**
 * ManageData function for Schedule management
 * Integrates with the existing modal tool calling pattern
 */
export const ManageData = async (
    supabase: SupabaseClient,
    userId: string,
    mode: "Schedule",
    action: "List" | "Search" | "Edit" | "Delete",
    searchQuery?: string,
    scheduleId?: string,
    title?: string,
    scheduledTime?: string,
    scheduleType?: 'once' | 'daily' | 'weekly' | 'custom',
    description?: string,
    schedulePattern?: ISchedulePattern,
    targetDate?: string
): Promise<any> => {
    try {
        switch (action) {
            case "List":
                return await getUserSchedules(supabase, userId);
            
            case "Search":
                if (!searchQuery) throw new Error("Search query required");
                return await searchUserSchedules(supabase, userId, searchQuery);
            
            case "Edit":
                if (scheduleId) {
                    // Update existing schedule
                    const updateData: UpdateScheduleData = {};
                    if (title !== undefined) updateData.title = title;
                    if (scheduledTime !== undefined) updateData.scheduled_time = scheduledTime;
                    if (scheduleType !== undefined) updateData.schedule_type = scheduleType;
                    if (description !== undefined) updateData.description = description;
                    if (schedulePattern !== undefined) updateData.schedule_pattern = schedulePattern;
                    if (targetDate !== undefined) updateData.target_date = targetDate;
                    
                    return await updateSchedule(supabase, scheduleId, updateData);
                } else {
                    // Create new schedule
                    if (!title || !scheduledTime || !scheduleType) {
                        throw new Error("Title, scheduled time, and schedule type are required for creating a schedule");
                    }
                    
                    const createData: CreateScheduleData = {
                        title,
                        scheduled_time: scheduledTime,
                        schedule_type: scheduleType,
                        description,
                        schedule_pattern: schedulePattern,
                        target_date: targetDate
                    };
                    
                    return await createSchedule(supabase, userId, createData);
                }
            
            case "Delete":
                if (!scheduleId) throw new Error("Schedule ID required for deletion");
                return await deleteSchedule(supabase, scheduleId);
            
            default:
                throw new Error(`Invalid action: ${action}`);
        }
    } catch (error) {
        console.error('ManageData Schedule error:', error);
        throw error;
    }
};

/**
 * Get all schedules for a user with current time information
 */
export const getUserSchedules = async (
    supabase: SupabaseClient,
    userId: string,
    sortBy: ScheduleSortOption = "time_asc"
): Promise<IScheduleWithCurrentTime[]> => {
    let query = supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);

    // Apply sorting
    switch (sortBy) {
        case "newest":
            query = query.order("created_at", { ascending: false });
            break;
        case "oldest":
            query = query.order("created_at", { ascending: true });
            break;
        case "time_asc":
            query = query.order("scheduled_time", { ascending: true });
            break;
        case "time_desc":
            query = query.order("scheduled_time", { ascending: false });
            break;
        case "title_asc":
            query = query.order("title", { ascending: true });
            break;
        case "title_desc":
            query = query.order("title", { ascending: false });
            break;
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch schedules: ${error.message}`);
    }

    // Add current time information to each schedule
    return (data || []).map(schedule => addCurrentTimeInfo(schedule));
};

/**
 * Search schedules by title or description
 */
export const searchUserSchedules = async (
    supabase: SupabaseClient,
    userId: string,
    searchTerm: string
): Promise<IScheduleWithCurrentTime[]> => {
    const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("scheduled_time", { ascending: true });

    if (error) {
        throw new Error(`Failed to search schedules: ${error.message}`);
    }

    return (data || []).map(schedule => addCurrentTimeInfo(schedule));
};

/**
 * Create a new schedule
 */
export const createSchedule = async (
    supabase: SupabaseClient,
    userId: string,
    scheduleData: CreateScheduleData
): Promise<ISchedule> => {
    const { data, error } = await supabase
        .from("schedules")
        .insert({
            user_id: userId,
            ...scheduleData,
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create schedule: ${error.message}`);
    }

    return data;
};

/**
 * Update an existing schedule
 */
export const updateSchedule = async (
    supabase: SupabaseClient,
    scheduleId: string,
    updateData: UpdateScheduleData
): Promise<ISchedule> => {
    const { data, error } = await supabase
        .from("schedules")
        .update({
            ...updateData,
            updated_at: new Date().toISOString(),
        })
        .eq("schedule_id", scheduleId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update schedule: ${error.message}`);
    }

    return data;
};

/**
 * Delete a schedule
 */
export const deleteSchedule = async (
    supabase: SupabaseClient,
    scheduleId: string
): Promise<void> => {
    const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("schedule_id", scheduleId);

    if (error) {
        throw new Error(`Failed to delete schedule: ${error.message}`);
    }
};

/**
 * Add current time information to a schedule
 */
const addCurrentTimeInfo = (schedule: ISchedule): IScheduleWithCurrentTime => {
    const now = new Date();
    const utc7Time = new Date(now.getTime());
    
    const currentTime = utc7Time.toTimeString().slice(0, 5); // HH:MM
    const currentDate = utc7Time.toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Calculate time until next occurrence and status
    const { timeUntil, status } = calculateTimeUntil(schedule, utc7Time);
    
    return {
        ...schedule,
        current_time: currentTime,
        current_date: currentDate,
        time_until: timeUntil,
        status: status
    };
};

/**
 * Calculate time until next occurrence of a schedule
 */
const calculateTimeUntil = (schedule: ISchedule, currentTime: Date): { timeUntil: string; status: 'upcoming' | 'passed' | 'today' } => {
    const [hours, minutes] = schedule.scheduled_time.split(':').map(Number);
    const currentDate = currentTime.toISOString().slice(0, 10);
    
    // Create schedule time for today
    const todayScheduleTime = new Date(currentTime);
    todayScheduleTime.setHours(hours, minutes, 0, 0);
    
    const timeDiff = todayScheduleTime.getTime() - currentTime.getTime();
    
    if (schedule.schedule_type === 'once') {
        if (schedule.target_date === currentDate) {
            if (timeDiff > 0) {
                return { timeUntil: formatTimeDifference(timeDiff), status: 'today' };
            } else {
                return { timeUntil: 'Đã qua', status: 'passed' };
            }
        } else {
            const targetDate = new Date(schedule.target_date + 'T' + schedule.scheduled_time);
            const targetDiff = targetDate.getTime() - currentTime.getTime();
            if (targetDiff > 0) {
                return { timeUntil: formatTimeDifference(targetDiff), status: 'upcoming' };
            } else {
                return { timeUntil: 'Đã qua', status: 'passed' };
            }
        }
    }
    
    // For recurring schedules
    if (timeDiff > 0) {
        return { timeUntil: formatTimeDifference(timeDiff), status: 'today' };
    } else {
        // Calculate next occurrence (tomorrow for daily, next valid day for weekly)
        const nextOccurrence = getNextOccurrence(schedule, currentTime);
        const nextDiff = nextOccurrence.getTime() - currentTime.getTime();
        return { timeUntil: formatTimeDifference(nextDiff), status: 'upcoming' };
    }
};

/**
 * Get next occurrence of a recurring schedule
 */
const getNextOccurrence = (schedule: ISchedule, currentTime: Date): Date => {
    const [hours, minutes] = schedule.scheduled_time.split(':').map(Number);
    
    if (schedule.schedule_type === 'daily') {
        const nextDay = new Date(currentTime);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(hours, minutes, 0, 0);
        return nextDay;
    }
    
    if (schedule.schedule_type === 'weekly' && schedule.schedule_pattern?.weekdays) {
        const currentDay = currentTime.getDay();
        const validDays = schedule.schedule_pattern.weekdays.sort();
        
        // Find next valid day
        let nextDay = validDays.find(day => day > currentDay);
        if (!nextDay) {
            nextDay = validDays[0]; // Next week
        }
        
        const daysToAdd = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
        const nextOccurrence = new Date(currentTime);
        nextOccurrence.setDate(nextOccurrence.getDate() + daysToAdd);
        nextOccurrence.setHours(hours, minutes, 0, 0);
        return nextOccurrence;
    }
    
    // Default to next day for custom schedules
    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(hours, minutes, 0, 0);
    return nextDay;
};

/**
 * Format time difference in human readable format
 */
const formatTimeDifference = (milliseconds: number): string => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
        return `${days} ngày ${remainingHours} giờ`;
    } else if (hours > 0) {
        return `${hours} giờ ${minutes} phút`;
    } else {
        return `${minutes} phút`;
    }
};
