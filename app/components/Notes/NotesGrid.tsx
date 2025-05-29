"use client";

import React, { useState } from "react";
import NoteCard from "./NoteCard";
import NoteImageViewer from "./NoteImageViewer";
import { ProcessedImage } from "@/db/images";

interface NotesGridProps {
    notes: INote[];
    onNoteClick: (note: INote) => void;
    onDeleteNote: (note: INote) => void;
    onTogglePin: (noteId: string) => void;
    currentUser: IUser;
}

export default function NotesGrid({
    notes,
    onNoteClick,
    onDeleteNote,
    onTogglePin,
    currentUser,
}: NotesGridProps) {
    const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);

    if (notes.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có ghi chú nào
                </h3>
                <p className="text-gray-600">
                    Tạo ghi chú đầu tiên của bạn để bắt đầu!
                </p>
            </div>
        );
    }

    // Separate pinned and unpinned notes
    const pinnedNotes = notes.filter(note => note.is_pinned === true);
    const unpinnedNotes = notes.filter(note => note.is_pinned !== true);

    return (
        <>
            <div className="space-y-6">
                {/* Pinned Notes */}
                {pinnedNotes.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            📌 Ghi chú đã ghim
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pinnedNotes.map((note) => (
                                <NoteCard
                                    key={note.note_id}
                                    note={note}
                                    onClick={() => onNoteClick(note)}
                                    onDelete={() => onDeleteNote(note)}
                                    onTogglePin={() => onTogglePin(note.note_id)}
                                    onImageClick={setSelectedImage}
                                    currentUser={currentUser}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular Notes */}
                {unpinnedNotes.length > 0 && (
                    <div>
                        {pinnedNotes.length > 0 && (
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Ghi chú khác
                            </h2>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {unpinnedNotes.map((note) => (
                                <NoteCard
                                    key={note.note_id}
                                    note={note}
                                    onClick={() => onNoteClick(note)}
                                    onDelete={() => onDeleteNote(note)}
                                    onTogglePin={() => onTogglePin(note.note_id)}
                                    onImageClick={setSelectedImage}
                                    currentUser={currentUser}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {selectedImage && (
                <NoteImageViewer
                    image={selectedImage}
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </>
    );
}
