# Library System Setup Guide

## 🚀 Quick Setup

The library system has been implemented but requires database setup to function fully. Follow these steps:

### 1. Database Setup

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run Database Setup**
   - Copy the contents of `database_setup.sql`
   - Paste and execute in the SQL Editor
   - This will create all necessary tables and policies

3. **Create Storage Bucket**
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `books`
   - Set it as private (not public)

### 2. Storage Policies Setup

Since storage policies need to be set up through the dashboard, follow these steps:

1. **Go to Storage > Policies**
2. **Create the following policies for the `books` bucket:**

#### Policy 1: Users can upload to private folder
```sql
CREATE POLICY "Users can upload to private folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'books' 
    AND auth.role() = 'authenticated' 
    AND (storage.foldername(name))[1] = 'private' 
    AND (storage.foldername(name))[2] = auth.uid()::text
);
```

#### Policy 2: Users can read their private files
```sql
CREATE POLICY "Users can read their private files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'books' 
    AND auth.role() = 'authenticated' 
    AND (storage.foldername(name))[1] = 'private' 
    AND (storage.foldername(name))[2] = auth.uid()::text
);
```

#### Policy 3: Everyone can read public files
```sql
CREATE POLICY "Everyone can read public files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'books' 
    AND (storage.foldername(name))[1] = 'public'
);
```

#### Policy 4: Admin can upload to public folder
```sql
CREATE POLICY "Admin can upload to public folder" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'books' 
    AND auth.email() = 'admin@elatoai.com' 
    AND (storage.foldername(name))[1] = 'public'
);
```

### 3. Update Code Configuration

Once the database is set up, update the code to use the proper bucket:

1. **Update `db/books.ts`**
   - Change all `.from('images')` to `.from('books')`
   - Remove the temporary mock implementations

2. **Update `db/reading.ts`**
   - Change `.from('images')` to `.from('books')`
   - Remove the temporary mock implementations

### 4. Current Status

**✅ Implemented:**
- Complete UI components
- File upload interface
- Reading interface with progress tracking
- Search and filtering
- Admin vs user permissions
- Vietnamese language support

**⚠️ Temporary Setup:**
- Currently using `images` bucket for file storage
- Database functions return empty arrays (mock data)
- Upload works but files are stored temporarily

**🔧 Needs Setup:**
- Database tables creation
- Storage bucket creation
- Storage policies configuration
- Code update to use proper bucket

## 🎯 Features Overview

### For Regular Users:
- Upload books to private library (.txt, .pdf, .doc, .docx)
- Read books with customizable settings
- Track reading progress automatically
- Search within books
- Sort and filter personal collection

### For Admin (admin@elatoai.com):
- Upload books to public library
- All regular user features
- Manage public book collection

### Reading Experience:
- **Multiple Reading Modes**: Full page, paragraphs, sentences
- **Smart Navigation**: Previous/Next with keyboard support
- **Search Integration**: Find and jump to specific content
- **Progress Persistence**: Never lose your place

## 🔧 Technical Details

### File Structure:
```
db/
├── books.ts          # Book management functions
├── reading.ts        # Reading manager and progress tracking
└── supabase.ts       # Database types (needs update)

app/components/Library/
├── LibraryTab.tsx           # Main library container
├── BookGrid.tsx             # Book grid display
├── BookCard.tsx             # Individual book cards
├── LibraryFilters.tsx       # Search and filter controls
├── BookUploadModal.tsx      # File upload interface
└── BookReader.tsx           # Reading interface

app/home/library/
└── page.tsx          # Library page

types/
└── types.d.ts        # Type definitions
```

### Storage Structure:
```
books/
├── public/           # Public library files
│   └── filename.ext
└── private/          # Private library files
    └── {user_id}/
        └── filename.ext
```

## 🚨 Important Notes

1. **Admin Account**: Only `admin@elatoai.com` can upload to public library
2. **File Types**: Supports .txt, .pdf, .doc, .docx files
3. **Security**: All files are private by default with proper RLS policies
4. **Performance**: Includes proper indexing for fast queries

## 🐛 Troubleshooting

### "Bucket not found" Error
- Create the `books` storage bucket in Supabase dashboard
- Update code to use `books` bucket instead of `images`

### "Table doesn't exist" Error
- Run the `database_setup.sql` script in Supabase SQL Editor

### Upload Permission Denied
- Check storage policies are properly configured
- Verify user authentication

### Reading Progress Not Saving
- Ensure database tables are created
- Check RLS policies allow user access

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify database tables exist in Supabase
3. Confirm storage bucket and policies are set up
4. Test with a simple .txt file first

The library system is fully functional once the database setup is complete!
