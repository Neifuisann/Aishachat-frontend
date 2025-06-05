"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProcessedBook } from "@/db/books";
import { BookOpen, User, Calendar, FileText, Globe, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface BookCardProps {
    book: ProcessedBook;
    readingHistory?: IReadingHistory;
    onSelect: () => void;
}

export default function BookCard({ book, readingHistory, onSelect }: BookCardProps) {
    const progress = readingHistory?.reading_progress || 0;
    const isStarted = readingHistory && readingHistory.current_page > 1;
    const isCompleted = progress >= 100;

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileTypeIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        return '📖';
    };

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer group max-w-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between min-w-0">
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-md text-gray-900 truncate group-hover:text-blue-600 transition-colors" title={book.title}>
                            {book.title.length > 30 ? book.title.substring(0, 30) + "..." : book.title}
                        </h3>
                        {book.author && (
                            <div className="flex items-center text-sm text-gray-600 mt-1 min-w-0">
                                <User size={14} className="mr-1 flex-shrink-0" />
                                <span className="truncate" title={book.author}>
                                    {book.author.length > 30 ? book.author.substring(0, 30) + "..." : book.author}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-2xl">{getFileTypeIcon(book.fileType)}</span>
                        {book.isPublic ? (
                            <Globe size={16} className="text-green-500" />
                        ) : (
                            <Lock size={16} className="text-gray-500" />
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
                {book.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={book.description}>
                        {book.description.length > 100 ? book.description.substring(0, 100) + "..." : book.description}
                    </p>
                )}

                {/* Reading Progress */}
                {readingHistory && (
                    <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Tiến độ đọc</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                            Trang {readingHistory.current_page} / {readingHistory.total_pages}
                        </div>
                    </div>
                )}

                {/* Book Info */}
                <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                        <FileText size={12} className="mr-1" />
                        <span>{formatFileSize(book.size)}</span>
                        {book.totalPages && (
                            <>
                                <span className="mx-2">•</span>
                                <span>{book.totalPages} trang</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span>
                            {formatDistanceToNow(book.uploadDate, { 
                                addSuffix: true, 
                                locale: vi 
                            })}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                    {isCompleted ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            Đã hoàn thành
                        </Badge>
                    ) : isStarted ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Đang đọc
                        </Badge>
                    ) : (
                        <Badge variant="outline">
                            Chưa đọc
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Button 
                    onClick={onSelect}
                    className="w-full"
                    variant={isStarted ? "default" : "outline"}
                >
                    <BookOpen size={16} className="mr-2" />
                    {isCompleted ? "Đọc lại" : isStarted ? "Tiếp tục đọc" : "Bắt đầu đọc"}
                </Button>
            </CardFooter>
        </Card>
    );
}
