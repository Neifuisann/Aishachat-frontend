import { type SupabaseClient } from "@supabase/supabase-js";

export interface BookMetadata {
    id: string;
    name: string;
    size: number;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: {
        eTag: string;
        size: number;
        mimetype: string;
        cacheControl: string;
        lastModified: string;
        contentLength: number;
        httpStatusCode: number;
    };
    bucket_id: string;
    owner: string;
    path_tokens: string[];
}

export interface ProcessedBook {
    id: string;
    name: string;
    title: string;
    author?: string;
    description?: string;
    url: string;
    uploadDate: Date;
    size: number;
    fileType: string;
    isPublic: boolean;
    totalPages?: number;
    owner?: string;
}

export type BookSortOption = "title" | "author" | "date" | "size" | "progress";

/**
 * Get all public books from the books bucket
 */
export const getPublicBooks = async (
    supabase: SupabaseClient,
    limit: number = 50,
    offset: number = 0
): Promise<ProcessedBook[]> => {
    try {
        // Get books from database
        const { data: books, error } = await supabase
            .from('books')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching public books:', error);
            return [];
        }

        if (!books || books.length === 0) {
            return [];
        }

        const processedBooks: ProcessedBook[] = [];

        for (const book of books) {
            // Get signed URL for the book file
            const { data: urlData, error: urlError } = await supabase.storage
                .from('books')
                .createSignedUrl(book.file_path, 3600); // 1 hour expiry

            if (urlError) {
                console.error('Error creating signed URL:', urlError);
                continue;
            }

            processedBooks.push({
                id: book.book_id,
                name: book.book_name,
                title: book.book_name,
                author: book.author,
                description: book.description,
                url: urlData.signedUrl,
                uploadDate: new Date(book.created_at),
                size: book.file_size || 0,
                fileType: book.file_type || 'text/plain',
                isPublic: book.is_public,
                totalPages: book.total_pages,
                owner: book.uploaded_by
            });
        }

        return processedBooks;
    } catch (error) {
        console.error('Error in getPublicBooks:', error);
        return [];
    }
};

/**
 * Get all private books for a specific user
 */
export const getUserBooks = async (
    supabase: SupabaseClient,
    userId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ProcessedBook[]> => {
    try {
        // Get books from database for this user
        const { data: books, error } = await supabase
            .from('books')
            .select('*')
            .eq('is_public', false)
            .eq('uploaded_by', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching user books:', error);
            return [];
        }

        if (!books || books.length === 0) {
            return [];
        }

        const processedBooks: ProcessedBook[] = [];

        for (const book of books) {
            // Get signed URL for the book file
            const { data: urlData, error: urlError } = await supabase.storage
                .from('books')
                .createSignedUrl(book.file_path, 3600); // 1 hour expiry

            if (urlError) {
                console.error('Error creating signed URL:', urlError);
                continue;
            }

            processedBooks.push({
                id: book.book_id,
                name: book.book_name,
                title: book.book_name,
                author: book.author,
                description: book.description,
                url: urlData.signedUrl,
                uploadDate: new Date(book.created_at),
                size: book.file_size || 0,
                fileType: book.file_type || 'text/plain',
                isPublic: book.is_public,
                totalPages: book.total_pages,
                owner: book.uploaded_by
            });
        }

        return processedBooks;
    } catch (error) {
        console.error('Error in getUserBooks:', error);
        return [];
    }
};

/**
 * Search books by title, author, or description
 */
export const searchBooks = async (
    supabase: SupabaseClient,
    searchTerm: string,
    isPublic: boolean,
    userId?: string
): Promise<ProcessedBook[]> => {
    try {
        let query = supabase
            .from('books')
            .select('*')
            .eq('is_public', isPublic);

        if (!isPublic && userId) {
            query = query.eq('uploaded_by', userId);
        }

        // Add search conditions
        query = query.or(`book_name.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

        const { data: books, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error searching books:', error);
            return [];
        }

        if (!books || books.length === 0) {
            return [];
        }

        const processedBooks: ProcessedBook[] = [];

        for (const book of books) {
            // Get signed URL for the book file
            const { data: urlData, error: urlError } = await supabase.storage
                .from('books')
                .createSignedUrl(book.file_path, 3600);

            if (urlError) {
                console.error('Error creating signed URL:', urlError);
                continue;
            }

            processedBooks.push({
                id: book.book_id,
                name: book.book_name,
                title: book.book_name,
                author: book.author,
                description: book.description,
                url: urlData.signedUrl,
                uploadDate: new Date(book.created_at),
                size: book.file_size || 0,
                fileType: book.file_type || 'text/plain',
                isPublic: book.is_public,
                totalPages: book.total_pages,
                owner: book.uploaded_by
            });
        }

        return processedBooks;
    } catch (error) {
        console.error('Error in searchBooks:', error);
        return [];
    }
};

/**
 * Upload a book file to Supabase storage and create database entry
 */
export const uploadBook = async (
    supabase: SupabaseClient,
    userId: string,
    bookData: BookUploadData
): Promise<{ success: boolean; error?: string; bookId?: string }> => {
    try {
        const { title, author, description, file, is_public = false } = bookData;

        if (!file) {
            return { success: false, error: 'Không có file được chọn' };
        }

        if (!title.trim()) {
            return { success: false, error: 'Tên sách không được để trống' };
        }

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Authentication error:', authError);
            return { success: false, error: 'Bạn cần đăng nhập để tải sách lên' };
        }

        if (user.id !== userId) {
            return { success: false, error: 'Lỗi xác thực người dùng' };
        }

        // Validate file type
        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                success: false,
                error: 'Chỉ hỗ trợ file .txt, .pdf, .doc, .docx'
            };
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { success: false, error: 'File quá lớn. Kích thước tối đa là 10MB' };
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Determine storage path based on public/private
        const filePath = is_public
            ? `public/${fileName}`
            : `private/${userId}/${fileName}`;

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
            .from('books')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return { success: false, error: `Không thể tải file lên: ${uploadError.message}` };
        }

        // Read file content to calculate pages (for text files)
        let totalPages = 1;
        if (file.type === 'text/plain') {
            try {
                const content = await file.text();
                // Estimate pages (assuming ~500 words per page, ~5 chars per word)
                const estimatedWords = content.length / 5;
                totalPages = Math.max(1, Math.ceil(estimatedWords / 500));
            } catch (error) {
                console.error('Error reading file content:', error);
            }
        }

        // Create database entry
        console.log('Attempting to insert book with data:', {
            book_name: title,
            file_path: filePath,
            total_pages: totalPages,
            is_public: is_public,
            author: author || null,
            description: description || null,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: userId
        });

        const { data: bookEntry, error: dbError } = await supabase
            .from('books')
            .insert([{
                book_name: title,
                file_path: filePath,
                total_pages: totalPages,
                is_public: is_public,
                author: author || null,
                description: description || null,
                file_size: file.size,
                file_type: file.type,
                uploaded_by: userId
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Error creating book entry:', dbError);
            console.error('Database error details:', JSON.stringify(dbError, null, 2));
            // Clean up uploaded file
            await supabase.storage.from('books').remove([filePath]);
            return { success: false, error: `Không thể tạo bản ghi sách: ${dbError.message}` };
        }

        return {
            success: true,
            bookId: bookEntry.book_id
        };

    } catch (error) {
        console.error('Error in uploadBook:', error);
        return { success: false, error: 'Có lỗi xảy ra khi tải sách lên' };
    }
};
