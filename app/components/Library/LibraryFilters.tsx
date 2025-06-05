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
import { Search, X } from "lucide-react";
import { BookSortOption } from "@/db/books";

interface LibraryFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    sortBy: BookSortOption;
    onSortChange: (value: BookSortOption) => void;
    filterBy: "all" | "read" | "unread";
    onFilterChange: (value: "all" | "read" | "unread") => void;
}

export default function LibraryFilters({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    filterBy,
    onFilterChange,
}: LibraryFiltersProps) {
    const clearSearch = () => {
        onSearchChange("");
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                    placeholder="Tìm kiếm theo tên sách, tác giả..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                        <X size={14} />
                    </Button>
                )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Ngày tải lên</SelectItem>
                        <SelectItem value="title">Tên sách</SelectItem>
                        <SelectItem value="author">Tác giả</SelectItem>
                        <SelectItem value="size">Kích thước</SelectItem>
                        <SelectItem value="progress">Tiến độ</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Lọc:</span>
                <Select value={filterBy} onValueChange={onFilterChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="read">Đã đọc</SelectItem>
                        <SelectItem value="unread">Chưa đọc</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
