-- Library System Database Setup
-- Run these commands in your Supabase SQL editor

-- 1. Create books table
CREATE TABLE IF NOT EXISTS public.books (
    book_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    total_pages INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT false,
    author TEXT,
    description TEXT,
    file_size BIGINT,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create reading_history table
CREATE TABLE IF NOT EXISTS public.reading_history (
    history_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_name TEXT NOT NULL,
    current_page INTEGER DEFAULT 1,
    total_pages INTEGER DEFAULT 1,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_name)
);

-- 3. Create reading_settings table
CREATE TABLE IF NOT EXISTS public.reading_settings (
    settings_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    reading_mode TEXT CHECK (reading_mode IN ('paragraphs', 'sentences', 'fullpage')) DEFAULT 'paragraphs',
    reading_amount INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create storage bucket for books (if not exists)
-- Note: This needs to be done through Supabase dashboard or API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', false);

-- 5. Set up Row Level Security (RLS) policies

-- Books table policies
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Allow users to read all public books
CREATE POLICY "Public books are viewable by everyone" ON public.books
    FOR SELECT USING (is_public = true);

-- Allow users to read their own private books
CREATE POLICY "Users can view their own private books" ON public.books
    FOR SELECT USING (is_public = false AND uploaded_by = auth.uid());

-- Allow users to insert their own books
CREATE POLICY "Users can insert their own books" ON public.books
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Allow users to update their own books
CREATE POLICY "Users can update their own books" ON public.books
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Allow users to delete their own books
CREATE POLICY "Users can delete their own books" ON public.books
    FOR DELETE USING (uploaded_by = auth.uid());

-- Reading history policies
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading history" ON public.reading_history
    FOR ALL USING (user_id = auth.uid());

-- Reading settings policies
ALTER TABLE public.reading_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reading settings" ON public.reading_settings
    FOR ALL USING (user_id = auth.uid());

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_is_public ON public.books(is_public);
CREATE INDEX IF NOT EXISTS idx_books_uploaded_by ON public.books(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_book ON public.reading_history(user_id, book_name);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read ON public.reading_history(last_read_at);

-- 7. Create storage policies for books bucket
-- Note: These need to be created through Supabase dashboard or API

-- Allow authenticated users to upload to their private folder
-- CREATE POLICY "Users can upload to private folder" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'books' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'private' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Allow authenticated users to read their private files
-- CREATE POLICY "Users can read their private files" ON storage.objects
--     FOR SELECT USING (bucket_id = 'books' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'private' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Allow everyone to read public files
-- CREATE POLICY "Everyone can read public files" ON storage.objects
--     FOR SELECT USING (bucket_id = 'books' AND (storage.foldername(name))[1] = 'public');

-- Allow admin to upload to public folder
-- CREATE POLICY "Admin can upload to public folder" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'books' AND auth.email() = 'admin@elatoai.com' AND (storage.foldername(name))[1] = 'public');

-- 8. Grant necessary permissions
GRANT ALL ON public.books TO authenticated;
GRANT ALL ON public.reading_history TO authenticated;
GRANT ALL ON public.reading_settings TO authenticated;

-- 9. Create function to automatically update reading_settings updated_at
CREATE OR REPLACE FUNCTION update_reading_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reading_settings_updated_at_trigger
    BEFORE UPDATE ON public.reading_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_settings_updated_at();

-- 10. Insert default reading settings for existing users (optional)
-- INSERT INTO public.reading_settings (user_id, reading_mode, reading_amount)
-- SELECT id, 'paragraphs', 3 FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;
