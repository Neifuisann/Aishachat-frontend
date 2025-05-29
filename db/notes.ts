import { type SupabaseClient } from "@supabase/supabase-js";

export interface CreateNoteData {
    title: string;
    body: string;
    image_id?: string | null;
    color?: string;
    is_pinned?: boolean;
}

export interface UpdateNoteData {
    title?: string;
    body?: string;
    image_id?: string | null;
    color?: string;
    is_pinned?: boolean;
}

export type SortOption = "newest" | "oldest" | "title_asc" | "title_desc" | "updated";

/**
 * Get all notes for a user with optional search and sorting
 */
export const getUserNotes = async (
    supabase: SupabaseClient,
    userId: string,
    options: {
        search?: string;
        sortBy?: SortOption;
        limit?: number;
        offset?: number;
    } = {}
): Promise<INote[]> => {
    try {
        let query = supabase
            .from("notes")
            .select("*")
            .eq("user_id", userId);

        // Apply search filter
        if (options.search && options.search.trim()) {
            const searchTerm = options.search.trim();
            query = query.or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        switch (options.sortBy) {
            case "oldest":
                query = query.order("created_at", { ascending: true });
                break;
            case "title_asc":
                query = query.order("title", { ascending: true });
                break;
            case "title_desc":
                query = query.order("title", { ascending: false });
                break;
            case "updated":
                query = query.order("updated_at", { ascending: false });
                break;
            case "newest":
            default:
                // Try to sort by pinned first if column exists, fallback to created_at
                try {
                    query = query.order("is_pinned", { ascending: false })
                                .order("created_at", { ascending: false });
                } catch (error) {
                    // Fallback if is_pinned column doesn't exist
                    query = query.order("created_at", { ascending: false });
                }
                break;
        }

        // Apply pagination
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching notes:", error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error("Error in getUserNotes:", error);
        throw error;
    }
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (
    supabase: SupabaseClient,
    noteId: string,
    userId: string
): Promise<INote | null> => {
    try {
        const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("note_id", noteId)
            .eq("user_id", userId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return null; // Note not found
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error in getNoteById:", error);
        throw error;
    }
};

/**
 * Create a new note
 */
export const createNote = async (
    supabase: SupabaseClient,
    userId: string,
    noteData: CreateNoteData
): Promise<INote> => {
    try {
        const insertData: any = {
            user_id: userId,
            title: noteData.title || "",
            body: noteData.body || "",
            image_id: noteData.image_id || null,
        };

        // Only add color and is_pinned if they're provided
        if (noteData.color !== undefined) {
            insertData.color = noteData.color;
        }
        if (noteData.is_pinned !== undefined) {
            insertData.is_pinned = noteData.is_pinned;
        }

        const { data, error } = await supabase
            .from("notes")
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error("Error creating note:", error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error in createNote:", error);
        throw error;
    }
};

/**
 * Update an existing note
 */
export const updateNote = async (
    supabase: SupabaseClient,
    noteId: string,
    userId: string,
    noteData: UpdateNoteData
): Promise<INote> => {
    try {
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        // Only include fields that are provided
        if (noteData.title !== undefined) updateData.title = noteData.title;
        if (noteData.body !== undefined) updateData.body = noteData.body;
        if (noteData.image_id !== undefined) updateData.image_id = noteData.image_id;
        if (noteData.color !== undefined) updateData.color = noteData.color;
        if (noteData.is_pinned !== undefined) updateData.is_pinned = noteData.is_pinned;

        const { data, error } = await supabase
            .from("notes")
            .update(updateData)
            .eq("note_id", noteId)
            .eq("user_id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating note:", error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error("Error in updateNote:", error);
        throw error;
    }
};

/**
 * Delete a note
 */
export const deleteNote = async (
    supabase: SupabaseClient,
    noteId: string,
    userId: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from("notes")
            .delete()
            .eq("note_id", noteId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting note:", error);
            throw error;
        }
    } catch (error) {
        console.error("Error in deleteNote:", error);
        throw error;
    }
};

/**
 * Toggle pin status of a note
 */
export const toggleNotePin = async (
    supabase: SupabaseClient,
    noteId: string,
    userId: string
): Promise<INote> => {
    try {
        // First get the current pin status
        const currentNote = await getNoteById(supabase, noteId, userId);
        if (!currentNote) {
            throw new Error("Note not found");
        }

        // Toggle the pin status
        return await updateNote(supabase, noteId, userId, {
            is_pinned: !currentNote.is_pinned
        });
    } catch (error) {
        console.error("Error in toggleNotePin:", error);
        throw error;
    }
};

/**
 * Get notes count for a user
 */
export const getUserNotesCount = async (
    supabase: SupabaseClient,
    userId: string
): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from("notes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId);

        if (error) {
            console.error("Error getting notes count:", error);
            throw error;
        }

        return count || 0;
    } catch (error) {
        console.error("Error in getUserNotesCount:", error);
        throw error;
    }
};


