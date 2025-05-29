"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    getUserNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleNotePin,
    SortOption,
    CreateNoteData,
    UpdateNoteData
} from "@/db/notes";
import NotesGrid from "./NotesGrid";
import NotesFilters from "./NotesFilters";
import NoteModal from "./NoteModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface NotesTabProps {
    currentUser: IUser;
}

export default function NotesTab({ currentUser }: NotesTabProps) {
    const [notes, setNotes] = useState<INote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedNote, setSelectedNote] = useState<INote | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<INote | null>(null);

    const supabase = createClient();

    // Load notes
    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedNotes = await getUserNotes(supabase, currentUser.user_id, {
                search: searchTerm,
                sortBy: sortBy,
            });
            setNotes(fetchedNotes);
        } catch (error) {
            console.error("Error loading notes:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải ghi chú. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [supabase, currentUser.user_id, searchTerm, sortBy]);

    // Initial load
    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Real-time subscription
    useEffect(() => {
        console.log("Setting up real-time subscription for user:", currentUser.user_id);

        const channel = supabase
            .channel('notes_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes',
                    filter: `user_id=eq.${currentUser.user_id}`,
                },
                (payload) => {
                    console.log("Real-time update received:", payload);

                    if (payload.eventType === "INSERT") {
                        console.log("Adding new note:", payload.new);
                        setNotes(prev => {
                            // Check if note already exists to avoid duplicates
                            const exists = prev.some(note => note.note_id === payload.new.note_id);
                            if (!exists) {
                                return [payload.new as INote, ...prev];
                            }
                            return prev;
                        });
                    } else if (payload.eventType === "UPDATE") {
                        console.log("Updating note:", payload.new);
                        setNotes(prev => prev.map(note =>
                            note.note_id === payload.new.note_id ? payload.new as INote : note
                        ));
                    } else if (payload.eventType === "DELETE") {
                        console.log("Deleting note:", payload.old);
                        setNotes(prev => prev.filter(note =>
                            note.note_id !== payload.old.note_id
                        ));
                    }
                }
            )
            .subscribe((status) => {
                console.log("Subscription status:", status);
            });

        return () => {
            console.log("Cleaning up real-time subscription");
            supabase.removeChannel(channel);
        };
    }, [supabase, currentUser.user_id]);

    // Handle create note
    const handleCreateNote = async (noteData: CreateNoteData) => {
        try {
            // Create optimistic note for immediate UI update
            const optimisticNote: INote = {
                note_id: `temp-${Date.now()}`, // Temporary ID
                user_id: currentUser.user_id,
                title: noteData.title || "",
                body: noteData.body || "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                image_id: noteData.image_id || null,
                color: noteData.color || "#ffffff",
                is_pinned: noteData.is_pinned || false,
            };

            // Add optimistic note to UI immediately
            setNotes(prev => [optimisticNote, ...prev]);
            setIsCreateModalOpen(false);

            // Create actual note in database
            const createdNote = await createNote(supabase, currentUser.user_id, noteData);

            // Replace optimistic note with real note
            setNotes(prev => prev.map(note =>
                note.note_id === optimisticNote.note_id ? createdNote : note
            ));

            toast({
                title: "Thành công",
                description: "Ghi chú đã được tạo thành công.",
            });
        } catch (error) {
            console.error("Error creating note:", error);

            // Remove optimistic note on error
            setNotes(prev => prev.filter(note => !note.note_id.startsWith('temp-')));

            toast({
                title: "Lỗi",
                description: "Không thể tạo ghi chú. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    // Handle update note
    const handleUpdateNote = async (noteId: string, noteData: UpdateNoteData) => {
        try {
            await updateNote(supabase, noteId, currentUser.user_id, noteData);
            setIsEditModalOpen(false);
            setSelectedNote(null);
            toast({
                title: "Thành công",
                description: "Ghi chú đã được cập nhật thành công.",
            });
        } catch (error) {
            console.error("Error updating note:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật ghi chú. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    // Handle delete note request (shows confirmation)
    const handleDeleteNoteRequest = (note: INote) => {
        setNoteToDelete(note);
        setIsDeleteDialogOpen(true);
    };

    // Handle confirmed delete note
    const handleConfirmDelete = async () => {
        if (!noteToDelete) return;

        try {
            // Optimistically remove note from UI immediately
            const noteToRemove = noteToDelete;
            setNotes(prev => prev.filter(note => note.note_id !== noteToRemove.note_id));

            // Delete from database
            await deleteNote(supabase, noteToRemove.note_id, currentUser.user_id);

            toast({
                title: "Thành công",
                description: "Ghi chú đã được xóa thành công.",
            });
        } catch (error) {
            console.error("Error deleting note:", error);

            // Restore note on error (rollback optimistic update)
            if (noteToDelete) {
                setNotes(prev => [noteToDelete, ...prev]);
            }

            toast({
                title: "Lỗi",
                description: "Không thể xóa ghi chú. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            // Always clean up state
            setIsDeleteDialogOpen(false);
            setNoteToDelete(null);
        }
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setNoteToDelete(null);
    };

    // Handle toggle pin
    const handleTogglePin = async (noteId: string) => {
        try {
            await toggleNotePin(supabase, noteId, currentUser.user_id);
        } catch (error) {
            console.error("Error toggling pin:", error);
            toast({
                title: "Lỗi",
                description: "Không thể thay đổi trạng thái ghim. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    // Handle note click for editing
    const handleNoteClick = (note: INote) => {
        setSelectedNote(note);
        setIsEditModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ghi chú của bạn</h1>
                    <p className="text-gray-600 mt-1">
                        {notes.length} ghi chú
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-white"
                >
                    <Plus size={16} className="mr-2" />
                    Tạo ghi chú mới
                </Button>
            </div>

            {/* Filters */}
            <NotesFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* Notes Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                </div>
            ) : (
                <NotesGrid
                    notes={notes}
                    onNoteClick={handleNoteClick}
                    onDeleteNote={handleDeleteNoteRequest}
                    onTogglePin={handleTogglePin}
                    currentUser={currentUser}
                />
            )}

            {/* Create Note Modal */}
            <NoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateNote}
                mode="create"
                currentUser={currentUser}
            />

            {/* Edit Note Modal */}
            {selectedNote && (
                <NoteModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedNote(null);
                    }}
                    onSave={(data: UpdateNoteData) => handleUpdateNote(selectedNote.note_id, data)}
                    mode="edit"
                    note={selectedNote}
                    currentUser={currentUser}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                noteTitle={noteToDelete?.title || ""}
            />
        </div>
    );
}
