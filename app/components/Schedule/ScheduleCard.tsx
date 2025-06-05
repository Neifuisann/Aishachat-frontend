"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Clock,
    Calendar,
    Repeat,
    MoreVertical,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle,
    Timer,
} from "lucide-react";

interface ScheduleCardProps {
    schedule: IScheduleWithCurrentTime;
    onClick: () => void;
    onDelete: () => void;
}

export default function ScheduleCard({ schedule, onClick, onDelete }: ScheduleCardProps) {
    const getScheduleTypeLabel = (type: string): string => {
        switch (type) {
            case "once": return "Một lần";
            case "daily": return "Hàng ngày";
            case "weekly": return "Hàng tuần";
            case "custom": return "Tùy chỉnh";
            default: return type;
        }
    };

    const getScheduleTypeIcon = (type: string) => {
        switch (type) {
            case "once": return <Calendar className="h-4 w-4" />;
            case "daily": return <Repeat className="h-4 w-4" />;
            case "weekly": return <Calendar className="h-4 w-4" />;
            case "custom": return <Repeat className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case "upcoming": return <Timer className="h-4 w-4 text-blue-500" />;
            case "today": return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case "passed": return <CheckCircle className="h-4 w-4 text-gray-400" />;
            default: return <Clock className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status?: string): string => {
        switch (status) {
            case "upcoming": return "border-blue-200 bg-blue-50";
            case "today": return "border-orange-200 bg-orange-50";
            case "passed": return "border-gray-200 bg-gray-50";
            default: return "border-gray-200 bg-white";
        }
    };

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const period = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const getWeekdaysText = (weekdays?: number[]): string => {
        if (!weekdays || weekdays.length === 0) return "";
        
        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return weekdays.map(day => dayNames[day]).join(", ");
    };

    return (
        <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${getStatusColor(schedule.status)}`}
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(schedule.status)}
                        <h3 className="font-semibold text-gray-900 truncate">
                            {schedule.title}
                        </h3>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Description */}
                {schedule.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {schedule.description}
                    </p>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                        {formatTime(schedule.scheduled_time)}
                    </span>
                </div>

                {/* Schedule Type */}
                <div className="flex items-center gap-2 mb-2">
                    {getScheduleTypeIcon(schedule.schedule_type)}
                    <span className="text-sm text-gray-600">
                        {getScheduleTypeLabel(schedule.schedule_type)}
                    </span>
                    {schedule.schedule_type === "weekly" && schedule.schedule_pattern?.weekdays && (
                        <span className="text-xs text-gray-500">
                            ({getWeekdaysText(schedule.schedule_pattern.weekdays)})
                        </span>
                    )}
                </div>

                {/* Target Date for "once" type */}
                {schedule.schedule_type === "once" && schedule.target_date && (
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {new Date(schedule.target_date).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                )}

                {/* Time Until */}
                {schedule.time_until && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                {schedule.status === 'passed' ? 'Đã qua' : 'Còn lại'}
                            </span>
                            <span className={`text-xs font-medium ${
                                schedule.status === 'today' ? 'text-orange-600' :
                                schedule.status === 'upcoming' ? 'text-blue-600' :
                                'text-gray-500'
                            }`}>
                                {schedule.time_until}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
