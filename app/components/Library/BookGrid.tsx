"use client";

import React from "react";
import { ProcessedBook } from "@/db/books";
import BookCard from "./BookCard";

interface BookGridProps {
    books: ProcessedBook[];
    readingHistory: IReadingHistory[];
    onBookSelect: (book: ProcessedBook) => void;
    emptyMessage: string;
}

export default function BookGrid({ 
    books, 
    readingHistory, 
    onBookSelect, 
    emptyMessage 
}: BookGridProps) {
    if (books.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">📚</div>
                <p className="text-gray-600">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full overflow-hidden">
            {books.map((book) => {
                const history = readingHistory.find(h => h.book_name === book.name);
                return (
                    <div key={book.id} className="min-w-0">
                        <BookCard
                            book={book}
                            readingHistory={history}
                            onSelect={() => onBookSelect(book)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
