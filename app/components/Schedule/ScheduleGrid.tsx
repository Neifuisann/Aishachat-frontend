"use client";

import React from "react";
import ScheduleCard from "./ScheduleCard";

interface ScheduleGridProps {
    schedules: IScheduleWithCurrentTime[];
    onScheduleClick: (schedule: IScheduleWithCurrentTime) => void;
    onDeleteSchedule: (schedule: IScheduleWithCurrentTime) => void;
}

export default function ScheduleGrid({
    schedules,
    onScheduleClick,
    onDeleteSchedule,
}: ScheduleGridProps) {
    if (schedules.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có lịch trình nào
                </h3>
                <p className="text-gray-600">
                    Tạo lịch trình đầu tiên để bắt đầu quản lý thời gian của bạn.
                </p>
            </div>
        );
    }

    // Group schedules by status
    const upcomingSchedules = schedules.filter(s => s.status === 'upcoming' || s.status === 'today');
    const passedSchedules = schedules.filter(s => s.status === 'passed');

    return (
        <div className="space-y-8">
            {/* Upcoming Schedules */}
            {upcomingSchedules.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Sắp tới ({upcomingSchedules.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingSchedules.map((schedule) => (
                            <ScheduleCard
                                key={schedule.schedule_id}
                                schedule={schedule}
                                onClick={() => onScheduleClick(schedule)}
                                onDelete={() => onDeleteSchedule(schedule)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Passed Schedules */}
            {passedSchedules.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-500 mb-4">
                        Đã qua ({passedSchedules.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {passedSchedules.map((schedule) => (
                            <ScheduleCard
                                key={schedule.schedule_id}
                                schedule={schedule}
                                onClick={() => onScheduleClick(schedule)}
                                onDelete={() => onDeleteSchedule(schedule)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
