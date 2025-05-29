"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserImages, groupImagesByTimePeriod, searchUserImages, getUserImagesByDateRange, ProcessedImage, ImageGroup } from "@/db/images";
import ImageGallery from "./ImageGallery";
import ImageFilters from "./ImageFilters";
import ImageModal from "./ImageModal";
import { Loader2 } from "lucide-react";

interface ActivityHistoryTabProps {
    currentUser: IUser;
}

export type SortOption = "newest" | "oldest";

const ActivityHistoryTab: React.FC<ActivityHistoryTabProps> = ({ currentUser }) => {
    const [images, setImages] = useState<ProcessedImage[]>([]);
    const [groupedImages, setGroupedImages] = useState<ImageGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState<SortOption>("newest");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const supabase = createClient();

    const loadImages = useCallback(async (reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setImages([]);
            } else {
                setLoadingMore(true);
            }

            const offset = reset ? 0 : images.length;
            let newImages: ProcessedImage[] = [];

            if (dateRange.from && dateRange.to) {
                // Load images by date range
                newImages = await getUserImagesByDateRange(
                    supabase,
                    currentUser.user_id,
                    dateRange.from,
                    dateRange.to,
                    20,
                    offset
                );
            } else if (searchTerm) {
                // Load images by search term
                newImages = await searchUserImages(
                    supabase,
                    currentUser.user_id,
                    searchTerm,
                    20,
                    offset
                );
            } else {
                // Load all images
                newImages = await getUserImages(
                    supabase,
                    currentUser.user_id,
                    20,
                    offset
                );
            }

            // Sort images
            const sortedImages = [...newImages].sort((a, b) => {
                const dateA = new Date(a.uploadDate).getTime();
                const dateB = new Date(b.uploadDate).getTime();
                return sortOption === "newest" ? dateB - dateA : dateA - dateB;
            });

            if (reset) {
                setImages(sortedImages);
            } else {
                setImages(prev => [...prev, ...sortedImages]);
            }

            setHasMore(newImages.length === 20);
            setError(null);
        } catch (err) {
            console.error("Error loading images:", err);
            setError("Không thể tải hình ảnh. Vui lòng thử lại.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [supabase, currentUser.user_id, searchTerm, sortOption, dateRange, images.length]);

    // Group images by time period
    useEffect(() => {
        const grouped = groupImagesByTimePeriod(images);
        setGroupedImages(grouped);
    }, [images]);

    // Load images on component mount and when filters change
    useEffect(() => {
        loadImages(true);
    }, [searchTerm, sortOption, dateRange]);

    const handleImageClick = (image: ProcessedImage) => {
        setSelectedImage(image);
        const index = images.findIndex(img => img.id === image.id);
        setCurrentImageIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleNextImage = () => {
        if (currentImageIndex < images.length - 1) {
            const nextIndex = currentImageIndex + 1;
            setCurrentImageIndex(nextIndex);
            setSelectedImage(images[nextIndex]);
        }
    };

    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            const prevIndex = currentImageIndex - 1;
            setCurrentImageIndex(prevIndex);
            setSelectedImage(images[prevIndex]);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            loadImages(false);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
    };

    const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
        setDateRange(range);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setDateRange({ from: undefined, to: undefined });
        setSortOption("newest");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-muted-foreground">Đang tải hình ảnh...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <button
                    onClick={() => loadImages(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-normal">Lịch sử hoạt động</h1>
                <p className="text-muted-foreground">
                    Xem lại tất cả hình ảnh bạn đã tải lên
                </p>
            </div>

            {/* Filters */}
            <ImageFilters
                searchTerm={searchTerm}
                sortOption={sortOption}
                dateRange={dateRange}
                onSearch={handleSearch}
                onSortChange={handleSortChange}
                onDateRangeChange={handleDateRangeChange}
                onClearFilters={handleClearFilters}
            />

            {/* Gallery */}
            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground text-lg mb-2">
                        Không tìm thấy hình ảnh nào
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm || dateRange.from || dateRange.to
                            ? "Thử thay đổi bộ lọc để xem thêm kết quả"
                            : "Bạn chưa tải lên hình ảnh nào"}
                    </p>
                </div>
            ) : (
                <ImageGallery
                    groupedImages={groupedImages}
                    onImageClick={handleImageClick}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                />
            )}

            {/* Modal */}
            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    isOpen={!!selectedImage}
                    onClose={handleCloseModal}
                    onNext={currentImageIndex < images.length - 1 ? handleNextImage : undefined}
                    onPrev={currentImageIndex > 0 ? handlePrevImage : undefined}
                    currentIndex={currentImageIndex + 1}
                    totalImages={images.length}
                />
            )}
        </div>
    );
};

export default ActivityHistoryTab;
