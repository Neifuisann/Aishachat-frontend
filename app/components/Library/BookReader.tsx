"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    Search,
    BookOpen,
    Loader2,
    X
} from "lucide-react";
import { ProcessedBook } from "@/db/books";
import { ReadingManager, getReadingHistory } from "@/db/reading";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface BookReaderProps {
    isOpen: boolean;
    onClose: () => void;
    book: ProcessedBook;
    currentUser: IUser;
}

export default function BookReader({ isOpen, onClose, book, currentUser }: BookReaderProps) {
    const [content, setContent] = useState<ReadingContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [readingHistory, setReadingHistory] = useState<IReadingHistory | null>(null);
    const [readingSettings, setReadingSettings] = useState<IReadingSettings | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [goToPage, setGoToPage] = useState("");

    const supabase = createClient();

    // Load initial data
    useEffect(() => {
        if (isOpen && book) {
            loadBookData();
        }
    }, [isOpen, book]);

    const loadBookData = async () => {
        try {
            setLoading(true);

            // Get reading history and settings
            const [history, settings] = await Promise.all([
                getReadingHistory(supabase, currentUser.user_id, book.name),
                ReadingManager(supabase, currentUser.user_id, "Settings", "Get")
            ]);

            setReadingHistory(history);
            setReadingSettings(settings);

            // Start reading from last position or beginning
            const readingContent = history
                ? await ReadingManager(supabase, currentUser.user_id, "Read", "Continue", book.name)
                : await ReadingManager(supabase, currentUser.user_id, "Read", "Start", book.name);

            setContent(readingContent);
        } catch (error) {
            console.error("Error loading book data:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải nội dung sách.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = async () => {
        if (!content || !content.hasNext) return;

        try {
            setLoading(true);
            const nextContent = await ReadingManager(
                supabase,
                currentUser.user_id,
                "Read",
                "GoTo",
                book.name,
                content.currentPage + 1
            );
            setContent(nextContent);
            
            // Update reading history
            const updatedHistory = await getReadingHistory(supabase, currentUser.user_id, book.name);
            setReadingHistory(updatedHistory);
        } catch (error) {
            console.error("Error going to next page:", error);
            toast({
                title: "Lỗi",
                description: "Không thể chuyển trang.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousPage = async () => {
        if (!content || !content.hasPrevious) return;

        try {
            setLoading(true);
            const prevContent = await ReadingManager(
                supabase,
                currentUser.user_id,
                "Read",
                "GoTo",
                book.name,
                content.currentPage - 1
            );
            setContent(prevContent);
            
            // Update reading history
            const updatedHistory = await getReadingHistory(supabase, currentUser.user_id, book.name);
            setReadingHistory(updatedHistory);
        } catch (error) {
            console.error("Error going to previous page:", error);
            toast({
                title: "Lỗi",
                description: "Không thể chuyển trang.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoToPage = async () => {
        const pageNum = parseInt(goToPage);
        if (!pageNum || !content || pageNum < 1 || pageNum > content.totalPages) {
            toast({
                title: "Lỗi",
                description: "Số trang không hợp lệ.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            const pageContent = await ReadingManager(
                supabase,
                currentUser.user_id,
                "Read",
                "GoTo",
                book.name,
                pageNum
            );
            setContent(pageContent);
            setGoToPage("");
            
            // Update reading history
            const updatedHistory = await getReadingHistory(supabase, currentUser.user_id, book.name);
            setReadingHistory(updatedHistory);
        } catch (error) {
            console.error("Error going to page:", error);
            toast({
                title: "Lỗi",
                description: "Không thể chuyển đến trang này.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        try {
            setLoading(true);
            const results = await ReadingManager(
                supabase,
                currentUser.user_id,
                "Search",
                "Find",
                book.name,
                undefined,
                searchTerm
            );
            setSearchResults(results.results || []);
        } catch (error) {
            console.error("Error searching in book:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tìm kiếm trong sách.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (mode: string, amount: number) => {
        try {
            const updatedSettings = await ReadingManager(
                supabase,
                currentUser.user_id,
                "Settings",
                "Set",
                undefined,
                undefined,
                undefined,
                mode as any,
                amount
            );
            setReadingSettings(updatedSettings);
            
            // Reload current page with new settings
            if (content) {
                const refreshedContent = await ReadingManager(
                    supabase,
                    currentUser.user_id,
                    "Read",
                    "GoTo",
                    book.name,
                    content.currentPage
                );
                setContent(refreshedContent);
            }
            
            toast({
                title: "Thành công",
                description: "Cài đặt đọc đã được cập nhật.",
            });
        } catch (error) {
            console.error("Error updating settings:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật cài đặt.",
                variant: "destructive",
            });
        }
    };

    const progress = readingHistory?.reading_progress || 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen size={20} />
                            {book.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSearch(!showSearch)}
                            >
                                <Search size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings size={16} />
                            </Button>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {readingHistory && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Tiến độ đọc: {progress}%</span>
                                <span>
                                    Trang {content?.currentPage || 0} / {content?.totalPages || 0}
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </DialogHeader>

                {/* Search Panel */}
                {showSearch && (
                    <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Tìm kiếm trong sách..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={loading}>
                                <Search size={16} />
                            </Button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="max-h-32 overflow-y-auto space-y-2">
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="text-sm p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                                        onClick={() => {
                                            setGoToPage(result.page.toString());
                                            handleGoToPage();
                                        }}
                                    >
                                        <div className="font-medium">Trang {result.page}</div>
                                        <div className="text-gray-600 truncate">{result.context}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Panel */}
                {showSettings && readingSettings && (
                    <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Chế độ đọc</label>
                                <Select
                                    value={readingSettings.reading_mode}
                                    onValueChange={(value) => 
                                        handleUpdateSettings(value, readingSettings.reading_amount)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fullpage">Toàn trang</SelectItem>
                                        <SelectItem value="paragraphs">Theo đoạn</SelectItem>
                                        <SelectItem value="sentences">Theo câu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Số lượng</label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={readingSettings.reading_mode === 'sentences' ? 20 : 10}
                                    value={readingSettings.reading_amount}
                                    onChange={(e) => 
                                        handleUpdateSettings(
                                            readingSettings.reading_mode, 
                                            parseInt(e.target.value) || 1
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Đang tải...</span>
                        </div>
                    ) : content ? (
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                {content.content}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            Không thể tải nội dung sách
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handlePreviousPage}
                        disabled={loading || !content?.hasPrevious}
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Trang trước
                    </Button>

                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Trang"
                            value={goToPage}
                            onChange={(e) => setGoToPage(e.target.value)}
                            className="w-20 text-center"
                            onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGoToPage}
                            disabled={loading || !goToPage}
                        >
                            Đi
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={loading || !content?.hasNext}
                    >
                        Trang sau
                        <ChevronRight size={16} className="ml-1" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
