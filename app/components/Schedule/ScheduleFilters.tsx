"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ScheduleSortOption } from "@/db/schedules";

interface ScheduleFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortBy: ScheduleSortOption;
    onSortChange: (value: ScheduleSortOption) => void;
}

export default function ScheduleFilters({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
}: ScheduleFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Tìm kiếm lịch trình..."
                    className="pl-10"
                />
            </div>

            {/* Sort */}
            <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="time_asc">Thời gian (sớm nhất)</SelectItem>
                        <SelectItem value="time_desc">Thời gian (muộn nhất)</SelectItem>
                        <SelectItem value="title_asc">Tiêu đề (A-Z)</SelectItem>
                        <SelectItem value="title_desc">Tiêu đề (Z-A)</SelectItem>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
