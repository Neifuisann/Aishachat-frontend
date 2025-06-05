import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * ReadingManager - Unified modal interface for reading system
 * Handles History, Read, Search, and Settings operations
 */
export const ReadingManager = async (
    supabase: SupabaseClient,
    userId: string,
    mode: "History" | "Read" | "Search" | "Settings",
    action: string,
    bookName?: string,
    pageNumber?: number,
    keyword?: string,
    readingMode?: 'paragraphs' | 'sentences' | 'fullpage',
    readingAmount?: number
): Promise<any> => {
    try {
        switch (mode) {
            case "History":
                return await handleHistoryMode(supabase, userId, action, bookName);
            
            case "Read":
                return await handleReadMode(supabase, userId, action, bookName, pageNumber);
            
            case "Search":
                return await handleSearchMode(supabase, userId, action, bookName, keyword);
            
            case "Settings":
                return await handleSettingsMode(supabase, userId, action, readingMode, readingAmount);
            
            default:
                throw new Error(`Invalid mode: ${mode}`);
        }
    } catch (error) {
        console.error('ReadingManager error:', error);
        throw error;
    }
};

/**
 * Handle History mode operations
 */
const handleHistoryMode = async (
    supabase: SupabaseClient,
    userId: string,
    action: string,
    bookName?: string
) => {
    switch (action) {
        case "Check":
            if (!bookName) throw new Error("Book name required for History Check");
            return await getReadingHistory(supabase, userId, bookName);
        
        default:
            throw new Error(`Invalid History action: ${action}`);
    }
};

/**
 * Handle Read mode operations
 */
const handleReadMode = async (
    supabase: SupabaseClient,
    userId: string,
    action: string,
    bookName?: string,
    pageNumber?: number
) => {
    switch (action) {
        case "Continue":
            if (!bookName) throw new Error("Book name required for Read Continue");
            return await continueReading(supabase, userId, bookName);
        
        case "Start":
            if (!bookName) throw new Error("Book name required for Read Start");
            return await startReading(supabase, userId, bookName);
        
        case "GoTo":
            if (!bookName || pageNumber === undefined) {
                throw new Error("Book name and page number required for Read GoTo");
            }
            return await goToPage(supabase, userId, bookName, pageNumber);
        
        default:
            throw new Error(`Invalid Read action: ${action}`);
    }
};

/**
 * Handle Search mode operations
 */
const handleSearchMode = async (
    supabase: SupabaseClient,
    userId: string,
    action: string,
    bookName?: string,
    keyword?: string
) => {
    switch (action) {
        case "Find":
            if (!bookName || !keyword) {
                throw new Error("Book name and keyword required for Search Find");
            }
            return await searchInBook(supabase, userId, bookName, keyword);
        
        default:
            throw new Error(`Invalid Search action: ${action}`);
    }
};

/**
 * Handle Settings mode operations
 */
const handleSettingsMode = async (
    supabase: SupabaseClient,
    userId: string,
    action: string,
    readingMode?: 'paragraphs' | 'sentences' | 'fullpage',
    readingAmount?: number
) => {
    switch (action) {
        case "Get":
            return await getReadingSettings(supabase, userId);
        
        case "Set":
            if (!readingMode || readingAmount === undefined) {
                throw new Error("Reading mode and amount required for Settings Set");
            }
            return await setReadingSettings(supabase, userId, readingMode, readingAmount);
        
        default:
            throw new Error(`Invalid Settings action: ${action}`);
    }
};

/**
 * Get reading history for a specific book
 */
export const getReadingHistory = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string
): Promise<IReadingHistory | null> => {
    try {
        const { data, error } = await supabase
            .from('reading_history')
            .select('*')
            .eq('user_id', userId)
            .eq('book_name', bookName)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching reading history:', error);
            throw error;
        }

        if (!data) return null;

        // Calculate reading progress
        const progress = data.total_pages > 0
            ? Math.round((data.current_page / data.total_pages) * 100)
            : 0;

        return {
            ...data,
            reading_progress: progress
        };
    } catch (error) {
        console.error('Error in getReadingHistory:', error);
        throw error;
    }
};

/**
 * Get all reading history for a user
 */
export const getAllReadingHistory = async (
    supabase: SupabaseClient,
    userId: string
): Promise<IReadingHistory[]> => {
    try {
        const { data, error } = await supabase
            .from('reading_history')
            .select('*')
            .eq('user_id', userId)
            .order('last_read_at', { ascending: false });

        if (error) {
            console.error('Error fetching all reading history:', error);
            throw error;
        }

        return (data || []).map(item => ({
            ...item,
            reading_progress: item.total_pages > 0
                ? Math.round((item.current_page / item.total_pages) * 100)
                : 0
        }));
    } catch (error) {
        console.error('Error in getAllReadingHistory:', error);
        throw error;
    }
};

/**
 * Update or create reading progress
 */
export const updateReadingProgress = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string,
    currentPage: number,
    totalPages: number
): Promise<void> => {
    try {
        const { error } = await supabase
            .from('reading_history')
            .upsert({
                user_id: userId,
                book_name: bookName,
                current_page: currentPage,
                total_pages: totalPages,
                last_read_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,book_name'
            });

        if (error) {
            console.error('Error updating reading progress:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error in updateReadingProgress:', error);
        throw error;
    }
};

/**
 * Get reading settings for a user
 */
export const getReadingSettings = async (
    supabase: SupabaseClient,
    userId: string
): Promise<IReadingSettings> => {
    try {
        const { data, error } = await supabase
            .from('reading_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching reading settings:', error);
            throw error;
        }

        // Return default settings if none exist
        if (!data) {
            return {
                settings_id: '',
                user_id: userId,
                reading_mode: 'paragraphs',
                reading_amount: 3,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }

        return data;
    } catch (error) {
        console.error('Error in getReadingSettings:', error);
        throw error;
    }
};

/**
 * Set reading settings for a user
 */
export const setReadingSettings = async (
    supabase: SupabaseClient,
    userId: string,
    readingMode: 'paragraphs' | 'sentences' | 'fullpage',
    readingAmount: number
): Promise<IReadingSettings> => {
    try {
        const { data, error } = await supabase
            .from('reading_settings')
            .upsert({
                user_id: userId,
                reading_mode: readingMode,
                reading_amount: readingAmount,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error setting reading settings:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in setReadingSettings:', error);
        throw error;
    }
};

/**
 * Get book content and metadata
 */
export const getBookContent = async (
    supabase: SupabaseClient,
    bookName: string
): Promise<{ content: string; totalPages: number } | null> => {
    try {
        // First get book metadata from database
        const { data: book, error: bookError } = await supabase
            .from('books')
            .select('*')
            .eq('book_name', bookName)
            .single();

        if (bookError) {
            console.error('Error fetching book metadata:', bookError);
            return null;
        }

        // Get the file content from storage
        const { data: fileData, error: fileError } = await supabase.storage
            .from('books')
            .download(book.file_path);

        if (fileError) {
            console.error('Error downloading book file:', fileError);
            return null;
        }

        const content = await fileData.text();

        return {
            content,
            totalPages: book.total_pages
        };
    } catch (error) {
        console.error('Error in getBookContent:', error);
        return null;
    }
};

/**
 * Split content into pages and get specific page
 */
const splitContentIntoPages = (content: string, wordsPerPage: number = 500): string[] => {
    const words = content.split(/\s+/);
    const pages: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerPage) {
        const pageWords = words.slice(i, i + wordsPerPage);
        pages.push(pageWords.join(' '));
    }

    return pages.length > 0 ? pages : [''];
};

/**
 * Get reading content based on mode and settings
 */
const getReadingContent = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string,
    page: number
): Promise<ReadingContent | null> => {
    try {
        const bookData = await getBookContent(supabase, bookName);
        if (!bookData) return null;

        const settings = await getReadingSettings(supabase, userId);
        const pages = splitContentIntoPages(bookData.content);

        if (page < 1 || page > pages.length) {
            throw new Error(`Invalid page number: ${page}`);
        }

        let content = pages[page - 1];

        // Apply reading mode settings
        if (settings.reading_mode === 'paragraphs') {
            const paragraphs = content.split('\n\n').slice(0, settings.reading_amount);
            content = paragraphs.join('\n\n');
        } else if (settings.reading_mode === 'sentences') {
            const sentences = content.split(/[.!?]+/).slice(0, settings.reading_amount);
            content = sentences.join('. ').trim();
            if (content && !content.match(/[.!?]$/)) {
                content += '.';
            }
        }
        // For 'fullpage', use content as is

        return {
            content,
            currentPage: page,
            totalPages: pages.length,
            hasNext: page < pages.length,
            hasPrevious: page > 1
        };
    } catch (error) {
        console.error('Error in getReadingContent:', error);
        return null;
    }
};

/**
 * Continue reading from last position
 */
const continueReading = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string
): Promise<ReadingContent | null> => {
    try {
        const history = await getReadingHistory(supabase, userId, bookName);
        const page = history ? history.current_page : 1;

        const content = await getReadingContent(supabase, userId, bookName, page);
        if (content) {
            await updateReadingProgress(supabase, userId, bookName, page, content.totalPages);
        }

        return content;
    } catch (error) {
        console.error('Error in continueReading:', error);
        return null;
    }
};

/**
 * Start reading from the beginning
 */
const startReading = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string
): Promise<ReadingContent | null> => {
    try {
        const content = await getReadingContent(supabase, userId, bookName, 1);
        if (content) {
            await updateReadingProgress(supabase, userId, bookName, 1, content.totalPages);
        }

        return content;
    } catch (error) {
        console.error('Error in startReading:', error);
        return null;
    }
};

/**
 * Go to a specific page
 */
const goToPage = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string,
    pageNumber: number
): Promise<ReadingContent | null> => {
    try {
        const content = await getReadingContent(supabase, userId, bookName, pageNumber);
        if (content) {
            await updateReadingProgress(supabase, userId, bookName, pageNumber, content.totalPages);
        }

        return content;
    } catch (error) {
        console.error('Error in goToPage:', error);
        return null;
    }
};

/**
 * Search for keywords within a book
 */
const searchInBook = async (
    supabase: SupabaseClient,
    userId: string,
    bookName: string,
    keyword: string
): Promise<{ results: Array<{ page: number; context: string; position: number }> }> => {
    try {
        // userId is not used in search but kept for consistency with other functions
        void userId;

        const bookData = await getBookContent(supabase, bookName);
        if (!bookData) {
            return { results: [] };
        }

        const pages = splitContentIntoPages(bookData.content);
        const results: Array<{ page: number; context: string; position: number }> = [];

        const searchTerm = keyword.toLowerCase();

        pages.forEach((pageContent, index) => {
            const lowerContent = pageContent.toLowerCase();
            let position = 0;

            while ((position = lowerContent.indexOf(searchTerm, position)) !== -1) {
                // Get context around the found keyword (50 characters before and after)
                const start = Math.max(0, position - 50);
                const end = Math.min(pageContent.length, position + keyword.length + 50);
                const context = pageContent.substring(start, end);

                results.push({
                    page: index + 1,
                    context: context,
                    position: position
                });

                position += keyword.length;
            }
        });

        return { results };
    } catch (error) {
        console.error('Error in searchInBook:', error);
        return { results: [] };
    }
};
