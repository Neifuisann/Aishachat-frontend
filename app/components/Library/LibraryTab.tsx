"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getPublicBooks, getUserBooks, searchBooks, ProcessedBook, BookSortOption } from "@/db/books";
import { getAllReadingHistory } from "@/db/reading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, BookOpen, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import BookGrid from "./BookGrid";
import LibraryFilters from "./LibraryFilters";
import BookUploadModal from "./BookUploadModal";
import BookReader from "./BookReader";

interface LibraryTabProps {
    currentUser: IUser;
}

export default function LibraryTab({ currentUser }: LibraryTabProps) {
    const [publicBooks, setPublicBooks] = useState<ProcessedBook[]>([]);
    const [privateBooks, setPrivateBooks] = useState<ProcessedBook[]>([]);
    const [readingHistory, setReadingHistory] = useState<IReadingHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<BookSortOption>("date");
    const [filterBy, setFilterBy] = useState<"all" | "read" | "unread">("all");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<ProcessedBook | null>(null);
    const [isReaderOpen, setIsReaderOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("public");

    const supabase = createClient();
    const isAdmin = currentUser.email === "admin@Aishaai.com";

    // Load books and reading history
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            
            const [publicBooksData, privateBooksData, historyData] = await Promise.all([
                searchTerm 
                    ? searchBooks(supabase, searchTerm, true)
                    : getPublicBooks(supabase),
                searchTerm 
                    ? searchBooks(supabase, searchTerm, false, currentUser.user_id)
                    : getUserBooks(supabase, currentUser.user_id),
                getAllReadingHistory(supabase, currentUser.user_id)
            ]);

            setPublicBooks(publicBooksData);
            setPrivateBooks(privateBooksData);
            setReadingHistory(historyData);
        } catch (error) {
            console.error("Error loading library data:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu thư viện. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [supabase, currentUser.user_id, searchTerm]);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle book upload success
    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        loadData(); // Reload books
        toast({
            title: "Thành công",
            description: "Sách đã được tải lên thành công.",
        });
    };

    // Handle book selection for reading
    const handleBookSelect = (book: ProcessedBook) => {
        setSelectedBook(book);
        setIsReaderOpen(true);
    };

    // Sort and filter books
    const sortAndFilterBooks = (books: ProcessedBook[]): ProcessedBook[] => {
        let filtered = books;

        // Apply reading status filter
        if (filterBy !== "all") {
            const readBookNames = new Set(readingHistory.map(h => h.book_name));
            filtered = books.filter(book => {
                const isRead = readBookNames.has(book.name);
                return filterBy === "read" ? isRead : !isRead;
            });
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "author":
                    return (a.author || "").localeCompare(b.author || "");
                case "date":
                    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
                case "size":
                    return b.size - a.size;
                case "progress":
                    const aProgress = readingHistory.find(h => h.book_name === a.name)?.reading_progress || 0;
                    const bProgress = readingHistory.find(h => h.book_name === b.name)?.reading_progress || 0;
                    return bProgress - aProgress;
                default:
                    return 0;
            }
        });
    };

    const sortedPublicBooks = sortAndFilterBooks(publicBooks);
    const sortedPrivateBooks = sortAndFilterBooks(privateBooks);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Đang tải thư viện...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">Thư viện sách</h1>
                    <p className="text-gray-600 mt-1 truncate">
                        Quản lý và đọc sách của bạn
                    </p>
                </div>
                <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-400 text-white flex-shrink-0"
                >
                    <Plus size={16} className="mr-2" />
                    Tải sách lên
                </Button>
            </div>

            {/* Filters */}
            <LibraryFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                filterBy={filterBy}
                onFilterChange={setFilterBy}
            />

            {/* Library Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="public" className="flex items-center gap-2 min-w-0">
                        <Users size={16} className="flex-shrink-0" />
                        <span className="truncate">Công khai ({sortedPublicBooks.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="private" className="flex items-center gap-2 min-w-0">
                        <BookOpen size={16} className="flex-shrink-0" />
                        <span className="truncate">Cá nhân ({sortedPrivateBooks.length})</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="mt-6">
                    <BookGrid
                        books={sortedPublicBooks}
                        readingHistory={readingHistory}
                        onBookSelect={handleBookSelect}
                        emptyMessage="Chưa có sách nào trong thư viện công khai"
                    />
                </TabsContent>

                <TabsContent value="private" className="mt-6">
                    <BookGrid
                        books={sortedPrivateBooks}
                        readingHistory={readingHistory}
                        onBookSelect={handleBookSelect}
                        emptyMessage="Bạn chưa có sách nào trong thư viện cá nhân"
                    />
                </TabsContent>
            </Tabs>

            {/* Upload Modal */}
            <BookUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
                currentUser={currentUser}
                isAdmin={isAdmin}
            />

            {/* Book Reader */}
            {selectedBook && (
                <BookReader
                    isOpen={isReaderOpen}
                    onClose={() => {
                        setIsReaderOpen(false);
                        setSelectedBook(null);
                        loadData(); // Reload to update reading progress
                    }}
                    book={selectedBook}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}
