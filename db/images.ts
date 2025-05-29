import { type SupabaseClient } from "@supabase/supabase-js";

export interface ImageMetadata {
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

export interface ProcessedImage {
    id: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    uploadDate: Date;
    size: number;
    mimetype: string;
    owner: string;
}

export interface ImageGroup {
    period: string;
    images: ProcessedImage[];
}

/**
 * Get all images uploaded by a specific user from the Supabase storage bucket
 * Images are stored in private/{userId}/ folder structure
 */
export const getUserImages = async (
    supabase: SupabaseClient,
    userId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ProcessedImage[]> => {
    try {
        // List all files in the images bucket for the user in private folder
        const { data: files, error } = await supabase.storage
            .from('images')
            .list(`private/${userId}`, {
                limit,
                offset,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('Error fetching user images:', error);
            return [];
        }

        if (!files || files.length === 0) {
            return [];
        }

        // Process each file to get the full URL and metadata
        const processedImages: ProcessedImage[] = [];

        for (const file of files) {
            // Skip folders
            if (!file.name || file.name.endsWith('/')) {
                continue;
            }

            // Get the signed URL for the private image
            const { data: urlData, error: urlError } = await supabase.storage
                .from('images')
                .createSignedUrl(`private/${userId}/${file.name}`, 3600); // 1 hour expiry

            if (urlError) {
                console.error('Error creating signed URL:', urlError);
                continue;
            }

            // Create thumbnail URL with signed URL
            const thumbnailUrl = urlData.signedUrl + '&width=300&height=300&resize=cover';

            processedImages.push({
                id: file.id || `private/${userId}/${file.name}`,
                name: file.name,
                url: urlData.signedUrl,
                thumbnailUrl,
                uploadDate: new Date(file.created_at || file.updated_at || Date.now()),
                size: file.metadata?.size || 0,
                mimetype: file.metadata?.mimetype || 'image/jpeg',
                owner: userId
            });
        }

        return processedImages;
    } catch (error) {
        console.error('Error in getUserImages:', error);
        return [];
    }
};

/**
 * Get images within a specific date range
 */
export const getUserImagesByDateRange = async (
    supabase: SupabaseClient,
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 50,
    offset: number = 0
): Promise<ProcessedImage[]> => {
    try {
        const allImages = await getUserImages(supabase, userId, 1000, 0); // Get more images to filter

        return allImages.filter(image => {
            const imageDate = image.uploadDate;
            return imageDate >= startDate && imageDate <= endDate;
        }).slice(offset, offset + limit);
    } catch (error) {
        console.error('Error in getUserImagesByDateRange:', error);
        return [];
    }
};

/**
 * Search images by filename
 */
export const searchUserImages = async (
    supabase: SupabaseClient,
    userId: string,
    searchTerm: string,
    limit: number = 50,
    offset: number = 0
): Promise<ProcessedImage[]> => {
    try {
        const allImages = await getUserImages(supabase, userId, 1000, 0);

        return allImages.filter(image =>
            image.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(offset, offset + limit);
    } catch (error) {
        console.error('Error in searchUserImages:', error);
        return [];
    }
};

/**
 * Group images by time periods (Today, Yesterday, This Week, etc.)
 */
export const groupImagesByTimePeriod = (images: ProcessedImage[]): ImageGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const groups: { [key: string]: ProcessedImage[] } = {
        'Hôm nay': [],
        'Hôm qua': [],
        'Tuần này': [],
        'Tháng này': [],
        'Tháng trước': [],
        'Cũ hơn': []
    };

    images.forEach(image => {
        const imageDate = new Date(image.uploadDate);
        const imageDateOnly = new Date(imageDate.getFullYear(), imageDate.getMonth(), imageDate.getDate());

        if (imageDateOnly.getTime() === today.getTime()) {
            groups['Hôm nay'].push(image);
        } else if (imageDateOnly.getTime() === yesterday.getTime()) {
            groups['Hôm qua'].push(image);
        } else if (imageDate >= thisWeekStart && imageDate < today) {
            groups['Tuần này'].push(image);
        } else if (imageDate >= thisMonthStart && imageDate < thisWeekStart) {
            groups['Tháng này'].push(image);
        } else if (imageDate >= lastMonthStart && imageDate < thisMonthStart) {
            groups['Tháng trước'].push(image);
        } else {
            groups['Cũ hơn'].push(image);
        }
    });

    // Convert to array and filter out empty groups
    return Object.entries(groups)
        .filter(([_, images]) => images.length > 0)
        .map(([period, images]) => ({ period, images }));
};

/**
 * Upload an image to the user's private folder
 */
export const uploadUserImage = async (
    supabase: SupabaseClient,
    userId: string,
    file: File
): Promise<{ success: boolean; error?: string; path?: string }> => {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { success: false, error: 'File must be an image' };
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `private/${userId}/${fileName}`;

        // Upload file to Supabase storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, path: data.path };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Upload failed' };
    }
};

/**
 * Get total count of user images
 */
export const getUserImageCount = async (
    supabase: SupabaseClient,
    userId: string
): Promise<number> => {
    try {
        const { data: files, error } = await supabase.storage
            .from('images')
            .list(`private/${userId}`);

        if (error) {
            console.error('Error getting image count:', error);
            return 0;
        }

        return files?.filter(file => file.name && !file.name.endsWith('/')).length || 0;
    } catch (error) {
        console.error('Error in getUserImageCount:', error);
        return 0;
    }
};
