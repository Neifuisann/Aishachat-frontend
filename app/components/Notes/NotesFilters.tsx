"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, SortAsc } from "lucide-react";
import { SortOption } from "@/db/notes";

interface NotesFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortBy: SortOption;
    onSortChange: (value: SortOption) => void;
}

export default function NotesFilters({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
}: NotesFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Tìm kiếm ghi chú..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
                <SortAsc className="text-gray-400 h-4 w-4" />
                <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="oldest">Cũ nhất</SelectItem>
                        <SelectItem value="updated">Cập nhật gần đây</SelectItem>
                        <SelectItem value="title_asc">Tiêu đề A-Z</SelectItem>
                        <SelectItem value="title_desc">Tiêu đề Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
