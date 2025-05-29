# Notes Feature Documentation

## Overview
A modern note-taking system integrated into the application with real-time synchronization, image support, and advanced organization features.

## Features

### Core Functionality
- **Create Notes**: Add new notes with title, body content, and optional images
- **Edit Notes**: Modify existing notes with real-time updates
- **Delete Notes**: Remove notes with confirmation
- **Search**: Full-text search across note titles and content
- **Sort**: Multiple sorting options (newest, oldest, title A-Z/Z-A, recently updated)

### Organization
- **Pin Notes**: Pin important notes to the top
- **Color Coding**: 8 predefined color themes for visual organization
- **Real-time Sync**: Live updates across all sessions using Supabase subscriptions

### Image Support
- **Image Attachments**: Attach images to notes with preview
- **Image Viewer**: Full-featured image viewer with zoom, rotation, and download
- **Storage Integration**: Secure image storage using Supabase with proper RLS policies

## User Interface

### Navigation
- New sidebar item "Ghi chú của bạn" (Your Notes)
- Accessible from both desktop and mobile navigation

### Layout
- **Grid View**: Responsive masonry-style grid layout
- **Pinned Section**: Separate section for pinned notes
- **Empty State**: Friendly empty state when no notes exist

### Note Cards
- **Color-coded backgrounds** based on note color
- **Pin indicator** for pinned notes
- **Image preview** for notes with attachments
- **Timestamp** showing last update
- **Dropdown menu** with edit, pin/unpin, and delete options

### Filters and Search
- **Search bar** with real-time filtering
- **Sort dropdown** with multiple options
- **Clean, intuitive interface** following app design patterns

## Technical Implementation

### Database Schema
```sql
create table public.notes (
  note_id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null,
  body text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  image_id text null,
  color text default '#ffffff',
  is_pinned boolean default false,
  constraint notes_pkey primary key (note_id),
  constraint notes_user_id_fkey foreign KEY (user_id) references users (user_id) on delete CASCADE
);
```

### Components Structure
```
app/components/Notes/
├── NotesTab.tsx           # Main container with state management
├── NotesGrid.tsx          # Grid layout and organization
├── NoteCard.tsx           # Individual note display
├── NoteModal.tsx          # Create/edit modal
├── NotesFilters.tsx       # Search and sort controls
└── NoteImageViewer.tsx    # Image viewer modal
```

### Database Functions
- `getUserNotes()` - Fetch user notes with search/sort
- `createNote()` - Create new note
- `updateNote()` - Update existing note
- `deleteNote()` - Delete note
- `toggleNotePin()` - Toggle pin status
- `subscribeToNotesChanges()` - Real-time subscriptions

### Real-time Features
- **Live Updates**: Notes appear/update/disappear in real-time
- **Optimistic Updates**: Immediate UI feedback
- **Conflict Resolution**: Proper handling of concurrent edits

## Color Palette
- **White**: Default (#ffffff)
- **Yellow**: Highlights (#fef3c7)
- **Blue**: Information (#dbeafe)
- **Green**: Success/Nature (#dcfce7)
- **Pink**: Personal (#fce7f3)
- **Purple**: Creative (#f3e8ff)
- **Red**: Important/Urgent (#fed7d7)
- **Cyan**: Cool/Tech (#e0f2fe)

## Security
- **Row Level Security**: Users can only access their own notes
- **Image Security**: Images stored in private user folders
- **Authentication**: Proper user authentication required
- **Input Validation**: Server-side validation for all inputs

## Performance
- **Efficient Queries**: Optimized database queries with proper indexing
- **Image Optimization**: Next.js Image component for optimized loading
- **Lazy Loading**: Components load as needed
- **Real-time Optimization**: Efficient subscription management

## Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Accessible color combinations
- **Focus Management**: Proper focus handling in modals

## Vietnamese Language Support
- **Full Localization**: All UI text in Vietnamese
- **Date Formatting**: Vietnamese date/time formatting
- **Cultural Appropriateness**: UI patterns suitable for Vietnamese users

## Usage Instructions

### Creating a Note
1. Click "Tạo ghi chú mới" button
2. Enter title and content
3. Optionally add an image
4. Choose a color theme
5. Pin if important
6. Click "Lưu" to save

### Organizing Notes
- **Search**: Use the search bar to find specific notes
- **Sort**: Use the dropdown to change sorting order
- **Pin**: Use the pin button to keep important notes at top
- **Color**: Use colors to categorize notes visually

### Image Features
- **Add Image**: Click "Chọn hình ảnh" in the note modal
- **View Image**: Click on image preview in note card
- **Image Viewer**: Zoom, rotate, and download images

## Future Enhancements
- **Tags System**: Add tagging for better organization
- **Export Features**: Export notes to PDF or other formats
- **Collaboration**: Share notes with other users
- **Rich Text**: Add rich text editing capabilities
- **Templates**: Pre-defined note templates
- **Backup**: Automatic backup and restore features
