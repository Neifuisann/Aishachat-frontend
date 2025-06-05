"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, AlertTriangle } from "lucide-react";
import { CreateScheduleData, UpdateScheduleData } from "@/db/schedules";
import { toast } from "@/components/ui/use-toast";
import TimeInput from "./TimeInput";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateScheduleData | UpdateScheduleData) => void;
    mode: "create" | "edit";
    schedule?: IScheduleWithCurrentTime;
    currentUser: IUser;
    onCheckConflicts: (time: string) => IScheduleWithCurrentTime[];
}

const WEEKDAYS = [
    { value: 0, label: "Chủ nhật" },
    { value: 1, label: "Thứ hai" },
    { value: 2, label: "Thứ ba" },
    { value: 3, label: "Thứ tư" },
    { value: 4, label: "Thứ năm" },
    { value: 5, label: "Thứ sáu" },
    { value: 6, label: "Thứ bảy" },
];

export default function ScheduleModal({
    isOpen,
    onClose,
    onSave,
    mode,
    schedule,
    currentUser,
    onCheckConflicts,
}: ScheduleModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [scheduleType, setScheduleType] = useState<'once' | 'daily' | 'weekly' | 'custom'>("once");
    const [targetDate, setTargetDate] = useState("");
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
    const [conflicts, setConflicts] = useState<IScheduleWithCurrentTime[]>([]);
    const [saving, setSaving] = useState(false);

    // Initialize form data
    useEffect(() => {
        if (mode === "edit" && schedule) {
            setTitle(schedule.title || "");
            setDescription(schedule.description || "");
            setScheduledTime(schedule.scheduled_time || "");
            setScheduleType(schedule.schedule_type || "once");
            setTargetDate(schedule.target_date || "");
            setSelectedWeekdays(schedule.schedule_pattern?.weekdays || []);
        } else {
            // Reset for create mode
            setTitle("");
            setDescription("");
            setScheduledTime("");
            setScheduleType("once");
            
            // Default target date to today for "once" type
            const today = new Date();
            const utc7Date = new Date(today.getTime() + (7 * 60 * 60 * 1000));
            setTargetDate(utc7Date.toISOString().slice(0, 10));
            setSelectedWeekdays([]);
        }
        setConflicts([]);
    }, [mode, schedule, isOpen]);

    // Check for conflicts when time changes
    useEffect(() => {
        if (scheduledTime && isOpen) {
            const conflictingSchedules = onCheckConflicts(scheduledTime);
            setConflicts(conflictingSchedules);
        }
    }, [scheduledTime, onCheckConflicts, isOpen]);

    const handleWeekdayToggle = (weekday: number) => {
        setSelectedWeekdays(prev => 
            prev.includes(weekday) 
                ? prev.filter(d => d !== weekday)
                : [...prev, weekday].sort()
        );
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề lịch trình.",
                variant: "destructive",
            });
            return;
        }

        if (!scheduledTime) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn thời gian.",
                variant: "destructive",
            });
            return;
        }

        if (scheduleType === "once" && !targetDate) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ngày cho lịch trình một lần.",
                variant: "destructive",
            });
            return;
        }

        if (scheduleType === "weekly" && selectedWeekdays.length === 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn ít nhất một ngày trong tuần.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);

        try {
            let schedulePattern: ISchedulePattern | null = null;

            if (scheduleType === "weekly") {
                schedulePattern = { weekdays: selectedWeekdays };
            }

            const scheduleData = {
                title: title.trim(),
                description: description.trim() || undefined,
                scheduled_time: scheduledTime,
                schedule_type: scheduleType,
                schedule_pattern: schedulePattern,
                target_date: scheduleType === "once" ? targetDate : null,
            };

            await onSave(scheduleData);
        } catch (error) {
            console.error("Error saving schedule:", error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu lịch trình. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Tạo lịch trình mới" : "Chỉnh sửa lịch trình"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Tạo một lịch trình mới với thời gian và loại lặp lại."
                            : "Chỉnh sửa thông tin lịch trình của bạn."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Uống nước, Đi bộ, Họp nhóm..."
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả chi tiết về lịch trình..."
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                        <Label htmlFor="time">Thời gian *</Label>
                        <TimeInput
                            value={scheduledTime}
                            onChange={setScheduledTime}
                            placeholder="Ví dụ: 6am, 18:30, 7pm..."
                        />
                        
                        {/* Conflict Warning */}
                        {conflicts.length > 0 && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Cảnh báo xung đột thời gian:</p>
                                    <ul className="mt-1 space-y-1">
                                        {conflicts.map(conflict => (
                                            <li key={conflict.schedule_id}>
                                                • {conflict.title} ({conflict.scheduled_time})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Schedule Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Loại lịch trình *</Label>
                        <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại lịch trình" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="once">Một lần</SelectItem>
                                <SelectItem value="daily">Hàng ngày</SelectItem>
                                <SelectItem value="weekly">Hàng tuần</SelectItem>
                                <SelectItem value="custom">Tùy chỉnh</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Target Date for "once" type */}
                    {scheduleType === "once" && (
                        <div className="space-y-2">
                            <Label htmlFor="targetDate">Ngày thực hiện *</Label>
                            <Input
                                id="targetDate"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Weekdays for "weekly" type */}
                    {scheduleType === "weekly" && (
                        <div className="space-y-2">
                            <Label>Các ngày trong tuần *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {WEEKDAYS.map(weekday => (
                                    <div key={weekday.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`weekday-${weekday.value}`}
                                            checked={selectedWeekdays.includes(weekday.value)}
                                            onCheckedChange={() => handleWeekdayToggle(weekday.value)}
                                        />
                                        <Label 
                                            htmlFor={`weekday-${weekday.value}`}
                                            className="text-sm font-normal"
                                        >
                                            {weekday.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom pattern info */}
                    {scheduleType === "custom" && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                                Lịch trình tùy chỉnh sẽ được cấu hình thông qua trò chuyện với AI.
                                Hiện tại sẽ hoạt động như lịch trình hàng ngày.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        <X size={16} className="mr-2" />
                        Hủy
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save size={16} className="mr-2" />
                        {saving ? "Đang lưu..." : "Lưu"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
