"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Download,
    Maximize2,
    Minimize2
} from "lucide-react";
import Image from "next/image";
import { ProcessedImage } from "@/db/images";

interface NoteImageViewerProps {
    image: ProcessedImage;
    isOpen: boolean;
    onClose: () => void;
}

export default function NoteImageViewer({
    image,
    isOpen,
    onClose,
}: NoteImageViewerProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = image.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const resetView = () => {
        setZoom(1);
        setRotation(0);
    };

    const handleClose = () => {
        resetView();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className={`${
                    isFullscreen
                        ? 'max-w-[100vw] max-h-[100vh] w-full h-full'
                        : 'max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh]'
                } p-0 bg-black/95 border-none`}
            >
                <DialogTitle className="sr-only">
                    Xem hình ảnh: {image.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Xem chi tiết hình ảnh với các tính năng phóng to, xoay và tải xuống
                </DialogDescription>

                <div className="relative w-full h-full flex flex-col">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 sm:gap-4 text-white min-w-0">
                            <h3 className="font-medium truncate text-sm sm:text-base max-w-[150px] sm:max-w-[300px]">
                                {image.name}
                            </h3>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {/* Zoom Controls */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.25}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                                <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>

                            <span className="text-white text-xs sm:text-sm min-w-[40px] sm:min-w-[60px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                                <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>

                            {/* Rotate */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRotate}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                                <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>

                            {/* Fullscreen Toggle - Hidden on mobile */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0 sm:h-9 sm:w-9 hidden sm:flex"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                            </Button>

                            {/* Download */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>

                            {/* Close */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0 sm:h-9 sm:w-9"
                            >
                                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden min-h-0">
                        <div
                            className="relative transition-transform duration-200 ease-in-out w-full h-full flex items-center justify-center"
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                            }}
                        >
                            <div className="relative max-w-full max-h-full">
                                <Image
                                    src={image.url}
                                    alt={image.name}
                                    width={480}
                                    height={480}
                                    className="max-w-full max-h-full object-contain"
                                    sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, 70vw"
                                    priority={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-2 sm:p-4 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                            <div className="truncate">
                                Tải lên: {image.uploadDate.toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetView}
                                    className="text-white hover:bg-white/20 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                                >
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
