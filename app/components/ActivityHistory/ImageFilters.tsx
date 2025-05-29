"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar as CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SortOption } from "./ActivityHistoryTab";
import { DateRange } from "react-day-picker";

interface ImageFiltersProps {
    searchTerm: string;
    sortOption: SortOption;
    dateRange: { from: Date | undefined; to: Date | undefined };
    onSearch: (term: string) => void;
    onSortChange: (option: SortOption) => void;
    onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
    onClearFilters: () => void;
}

const ImageFilters: React.FC<ImageFiltersProps> = ({
    searchTerm,
    sortOption,
    dateRange,
    onSearch,
    onSortChange,
    onDateRangeChange,
    onClearFilters,
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(localSearchTerm);
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        if (range) {
            onDateRangeChange({
                from: range.from,
                to: range.to
            });
        }
        setIsDatePickerOpen(false);
    };

    const clearDateRange = () => {
        onDateRangeChange({ from: undefined, to: undefined });
    };

    const hasActiveFilters = searchTerm || dateRange.from || dateRange.to || sortOption !== "newest";

    return (
        <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                {/* Search */}
                <div className="flex-1 min-w-0">
                    <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                        Tìm kiếm theo tên file
                    </Label>
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            type="text"
                            placeholder="Nhập tên file..."
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            className="pl-10 pr-4"
                        />
                    </form>
                </div>

                {/* Sort */}
                <div className="w-full sm:w-auto min-w-[180px]">
                    <Label className="text-sm font-medium mb-2 block">
                        Sắp xếp
                    </Label>
                    <Select value={sortOption} onValueChange={(value: SortOption) => onSortChange(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Mới nhất trước</SelectItem>
                            <SelectItem value="oldest">Cũ nhất trước</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range Picker */}
                <div className="w-full sm:w-auto min-w-[200px]">
                    <Label className="text-sm font-medium mb-2 block">
                        Khoảng thời gian
                    </Label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateRange.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                                            {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                                        </>
                                    ) : (
                                        format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                                    )
                                ) : (
                                    "Chọn ngày"
                                )}
                                {(dateRange.from || dateRange.to) && (
                                    <X
                                        className="ml-auto h-4 w-4 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearDateRange();
                                        }}
                                    />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={handleDateSelect}
                                numberOfMonths={2}
                                locale={vi}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Filter Actions */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span>
                        {hasActiveFilters
                            ? "Đang áp dụng bộ lọc"
                            : "Hiển thị tất cả hình ảnh"}
                    </span>
                </div>

                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-sm"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Xóa bộ lọc
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ImageFilters;
