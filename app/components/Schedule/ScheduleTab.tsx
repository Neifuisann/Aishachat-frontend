"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import ScheduleModal from "./ScheduleModal";
import ScheduleGrid from "./ScheduleGrid";
import ScheduleFilters from "./ScheduleFilters";
import { 
    getUserSchedules, 
    searchUserSchedules, 
    createSchedule, 
    updateSchedule, 
    deleteSchedule,
    CreateScheduleData, 
    UpdateScheduleData,
    ScheduleSortOption 
} from "@/db/schedules";

interface ScheduleTabProps {
    currentUser: IUser;
}

export default function ScheduleTab({ currentUser }: ScheduleTabProps) {
    const [schedules, setSchedules] = useState<IScheduleWithCurrentTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<ScheduleSortOption>("time_asc");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<IScheduleWithCurrentTime | null>(null);
    const [currentTime, setCurrentTime] = useState<string>("");

    const supabase = createClient();

    // Update current time every minute
    useEffect(() => {
        const updateCurrentTime = () => {
            const now = new Date();
            const utc7Time = new Date(now.getTime());
            setCurrentTime(utc7Time.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            }));
        };

        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Load schedules
    const loadSchedules = useCallback(async () => {
        try {
            setLoading(true);
            let schedulesData: IScheduleWithCurrentTime[];

            if (searchTerm.trim()) {
                schedulesData = await searchUserSchedules(supabase, currentUser.user_id, searchTerm);
            } else {
                schedulesData = await getUserSchedules(supabase, currentUser.user_id, sortBy);
            }

            setSchedules(schedulesData);
        } catch (error) {
            console.error("Error loading schedules:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải lịch trình. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [supabase, currentUser.user_id, searchTerm, sortBy]);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    // Create schedule
    const handleCreateSchedule = async (data: CreateScheduleData) => {
        try {
            await createSchedule(supabase, currentUser.user_id, data);
            toast({
                title: "Thành công",
                description: "Đã tạo lịch trình mới.",
            });
            setIsCreateModalOpen(false);
            loadSchedules();
        } catch (error) {
            console.error("Error creating schedule:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tạo lịch trình. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    // Update schedule
    const handleUpdateSchedule = async (scheduleId: string, data: UpdateScheduleData) => {
        try {
            await updateSchedule(supabase, scheduleId, data);
            toast({
                title: "Thành công",
                description: "Đã cập nhật lịch trình.",
            });
            setIsEditModalOpen(false);
            setSelectedSchedule(null);
            loadSchedules();
        } catch (error) {
            console.error("Error updating schedule:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật lịch trình. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    // Delete schedule
    const handleDeleteScheduleRequest = async (schedule: IScheduleWithCurrentTime) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa lịch trình "${schedule.title}"?`)) {
            try {
                await deleteSchedule(supabase, schedule.schedule_id);
                toast({
                    title: "Thành công",
                    description: "Đã xóa lịch trình.",
                });
                loadSchedules();
            } catch (error) {
                console.error("Error deleting schedule:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể xóa lịch trình. Vui lòng thử lại.",
                    variant: "destructive",
                });
            }
        }
    };

    // Edit schedule
    const handleScheduleClick = (schedule: IScheduleWithCurrentTime) => {
        setSelectedSchedule(schedule);
        setIsEditModalOpen(true);
    };

    // Check for conflicts
    const checkForConflicts = (newTime: string, excludeId?: string): IScheduleWithCurrentTime[] => {
        return schedules.filter(schedule => 
            schedule.scheduled_time === newTime && 
            schedule.schedule_id !== excludeId &&
            schedule.is_active
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lịch trình của bạn</h1>
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Clock size={16} />
                        <span>Hiện tại: {currentTime} (UTC+7)</span>
                        <span>•</span>
                        <span>{schedules.length} lịch trình</span>
                    </div>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-400 text-white"
                >
                    <Plus size={16} className="mr-2" />
                    Tạo lịch trình mới
                </Button>
            </div>

            {/* Filters */}
            <ScheduleFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Schedules Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <ScheduleGrid
                    schedules={schedules}
                    onScheduleClick={handleScheduleClick}
                    onDeleteSchedule={handleDeleteScheduleRequest}
                />
            )}

            {/* Create Schedule Modal */}
            <ScheduleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={(data: CreateScheduleData | UpdateScheduleData) => {
                    const createData: CreateScheduleData = {
                        title: data.title || "",
                        description: data.description,
                        scheduled_time: data.scheduled_time || "",
                        schedule_type: data.schedule_type || "once",
                        schedule_pattern: data.schedule_pattern,
                        target_date: data.target_date
                    };
                    handleCreateSchedule(createData);
                }}
                mode="create"
                currentUser={currentUser}
                onCheckConflicts={checkForConflicts}
            />

            {/* Edit Schedule Modal */}
            {selectedSchedule && (
                <ScheduleModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedSchedule(null);
                    }}
                    onSave={(data: UpdateScheduleData) => 
                        handleUpdateSchedule(selectedSchedule.schedule_id, data)
                    }
                    mode="edit"
                    schedule={selectedSchedule}
                    currentUser={currentUser}
                    onCheckConflicts={(time) => checkForConflicts(time, selectedSchedule.schedule_id)}
                />
            )}
        </div>
    );
}
