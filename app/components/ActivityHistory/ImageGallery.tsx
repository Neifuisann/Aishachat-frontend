"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, FileImage } from "lucide-react";
import { ProcessedImage, ImageGroup } from "@/db/images";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ImageGalleryProps {
    groupedImages: ImageGroup[];
    onImageClick: (image: ProcessedImage) => void;
    onLoadMore: () => void;
    hasMore: boolean;
    loadingMore: boolean;
}

interface ImageItemProps {
    image: ProcessedImage;
    onClick: (image: ProcessedImage) => void;
    isLast?: boolean;
    lastImageRef?: (node: HTMLDivElement | null) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ image, onClick, isLast, lastImageRef }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        if (!imageError) {
            setImageError(true);
        }
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Use original URL if thumbnail failed, otherwise use thumbnail
    const imageSrc = imageError ? image.url : image.thumbnailUrl;

    return (
        <div
            ref={isLast ? lastImageRef : null}
            className="group relative bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-200"
            style={{ aspectRatio: '4/3', minHeight: '60px' }}
            onClick={() => onClick(image)}
        >
            {/* Loading placeholder */}
            {imageLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {/* Image */}
            <div className="absolute inset-0">
                <Image
                    src={imageSrc}
                    alt={image.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 14vw"
                    loading="lazy"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                />
            </div>

            {/* Overlay with image info */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-xs font-medium truncate mb-1">
                        {image.name}
                    </p>
                    <div className="flex justify-between items-center text-xs text-white/80">
                        <span>
                            {format(image.uploadDate, "dd/MM/yyyy", { locale: vi })}
                        </span>
                        <span>{formatFileSize(image.size)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
    groupedImages,
    onImageClick,
    onLoadMore,
    hasMore,
    loadingMore,
}) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Infinite scroll implementation
    const lastImageElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loadingMore) return;
            if (observerRef.current) observerRef.current.disconnect();
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    onLoadMore();
                }
            });
            if (node) observerRef.current.observe(node);
        },
        [loadingMore, hasMore, onLoadMore]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    if (groupedImages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <FileImage className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-2">Không có hình ảnh nào</p>
                <p className="text-sm text-muted-foreground text-center">
                    Hình ảnh bạn tải lên sẽ xuất hiện ở đây
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {groupedImages.map((group, groupIndex) => (
                <div key={group.period} className="space-y-4">
                    {/* Group Header */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">{group.period}</h2>
                        <span className="text-sm text-muted-foreground">
                            ({group.images.length} hình ảnh)
                        </span>
                    </div>

                    {/* Image Grid - Compact layout for smaller 4:3 previews */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {group.images.map((image, imageIndex) => {
                            const isLastImage =
                                groupIndex === groupedImages.length - 1 &&
                                imageIndex === group.images.length - 1;

                            return (
                                <ImageItem
                                    key={image.id}
                                    image={image}
                                    onClick={onImageClick}
                                    isLast={isLastImage}
                                    lastImageRef={isLastImage ? lastImageElementRef : undefined}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Load More Button / Loading Indicator */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Đang tải thêm hình ảnh...</span>
                    </div>
                ) : hasMore ? (
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        className="px-8"
                    >
                        Tải thêm hình ảnh
                    </Button>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        Đã hiển thị tất cả hình ảnh
                    </p>
                )}
            </div>
        </div>
    );
};

export default ImageGallery;
