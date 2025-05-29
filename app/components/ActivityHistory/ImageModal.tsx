"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    ChevronLeft,
    ChevronRight,
    Download,
    Calendar,
    FileText,
    HardDrive
} from "lucide-react";
import Image from "next/image";
import { ProcessedImage } from "@/db/images";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ImageModalProps {
    image: ProcessedImage;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    currentIndex: number;
    totalImages: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
    image,
    isOpen,
    onClose,
    onNext,
    onPrev,
    currentIndex,
    totalImages,
}) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Reset zoom, rotation, and position when image changes
    useEffect(() => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, [image.id]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowLeft":
                    onPrev?.();
                    break;
                case "ArrowRight":
                    onNext?.();
                    break;
                case "+":
                case "=":
                    handleZoomIn();
                    break;
                case "-":
                    handleZoomOut();
                    break;
                case "r":
                case "R":
                    handleRotate();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 5));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, 0.1));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    }, [zoom, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart, zoom]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = image.url;
        link.download = image.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] sm:max-h-[90vh] md:max-w-[85vw] md:max-h-[85vh] p-0 bg-black/95 border-none">
                <DialogTitle className="sr-only">
                    Xem hình ảnh: {image.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Xem chi tiết hình ảnh với các tính năng phóng to, xoay và điều hướng
                </DialogDescription>
                <div className="relative w-full h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4 text-white">
                            <h3 className="font-medium truncate max-w-[300px]">{image.name}</h3>
                            <span className="text-sm text-white/70">
                                {currentIndex} / {totalImages}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                className="text-white hover:bg-white/20"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div
                        className="flex-1 relative overflow-hidden cursor-move min-h-[400px]"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDragging ? "none" : "transform 0.2s ease-out",
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
                                    priority
                                    draggable={false}
                                />
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        {onPrev && (
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={onPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                        )}
                        {onNext && (
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={onNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
                        {/* Zoom and Rotation Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                className="text-white hover:bg-white/20"
                                disabled={zoom <= 0.1}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-white text-sm min-w-[60px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                className="text-white hover:bg-white/20"
                                disabled={zoom >= 5}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRotate}
                                className="text-white hover:bg-white/20 ml-2"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-white hover:bg-white/20 text-xs"
                            >
                                Đặt lại
                            </Button>
                        </div>

                        {/* Image Metadata */}
                        <div className="flex items-center gap-4 text-white/70 text-sm">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(image.uploadDate, "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <HardDrive className="h-4 w-4" />
                                <span>{formatFileSize(image.size)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{image.mimetype}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageModal;
