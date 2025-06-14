"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pin, PinOff, Trash2, Edit, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { ProcessedImage } from "@/db/images";

interface NoteCardProps {
    note: INote;
    onClick: () => void;
    onDelete: () => void;
    onTogglePin: () => void;
    onImageClick: (image: ProcessedImage) => void;
    currentUser: IUser;
}

// Predefined color palette
const NOTE_COLORS = {
    "#ffffff": "bg-white border-gray-200",
    "#fef3c7": "bg-yellow-50 border-yellow-200",
    "#dbeafe": "bg-blue-50 border-blue-200",
    "#dcfce7": "bg-green-50 border-green-200",
    "#fce7f3": "bg-pink-50 border-pink-200",
    "#f3e8ff": "bg-purple-50 border-purple-200",
    "#fed7d7": "bg-red-50 border-red-200",
    "#e0f2fe": "bg-cyan-50 border-cyan-200",
} as const;

export default function NoteCard({
    note,
    onClick,
    onDelete,
    onTogglePin,
    onImageClick,
    currentUser,
}: NoteCardProps) {
    const [imageData, setImageData] = useState<ProcessedImage | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const supabase = createClient();

    // Load image data if note has an image
    useEffect(() => {
        const loadImage = async () => {
            if (!note.image_id) return;

            try {
                setImageLoading(true);

                // Get signed URL for the image
                const { data: signedUrlData } = await supabase.storage
                    .from("images")
                    .createSignedUrl(`private/${currentUser.user_id}/${note.image_id}`, 3600);

                if (signedUrlData?.signedUrl) {
                    const processedImage: ProcessedImage = {
                        id: note.image_id,
                        name: note.image_id,
                        url: signedUrlData.signedUrl,
                        thumbnailUrl: signedUrlData.signedUrl,
                        uploadDate: new Date(note.created_at),
                        size: 0,
                        mimetype: "image/*",
                        owner: currentUser.user_id,
                    };
                    setImageData(processedImage);
                }
            } catch (error) {
                console.error("Error loading image:", error);
            } finally {
                setImageLoading(false);
            }
        };

        loadImage();
    }, [note.image_id, currentUser.user_id, supabase, note.created_at]);

    const noteColor = note.color || "#ffffff";
    const colorClass = NOTE_COLORS[noteColor as keyof typeof NOTE_COLORS] || NOTE_COLORS["#ffffff"];

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't trigger onClick if clicking on dropdown or image
        if ((e.target as HTMLElement).closest('[data-dropdown]') ||
            (e.target as HTMLElement).closest('[data-image]')) {
            return;
        }
        onClick();
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (imageData) {
            onImageClick(imageData);
        }
    };

    const handleDeleteClick = () => {
        setDropdownOpen(false); // Close dropdown first
        onDelete(); // Then trigger delete
    };

    return (
        <Card
            className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${colorClass} relative group`}
            onClick={handleCardClick}
        >
            {/* Pin indicator */}
            {note.is_pinned === true && (
                <div className="absolute top-2 left-2 z-10">
                    <Pin className="h-4 w-4 text-yellow-600 fill-current" />
                </div>
            )}

            {/* Dropdown menu */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" data-dropdown>
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                            {note.is_pinned === true ? (
                                <>
                                    <PinOff className="h-4 w-4 mr-2" />
                                    Bỏ ghim
                                </>
                            ) : (
                                <>
                                    <Pin className="h-4 w-4 mr-2" />
                                    Ghim
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick();
                            }}
                            className="text-red-600"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CardHeader className={`pb-3 ${note.is_pinned === true ? 'pt-8' : 'pt-4'}`}>
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                    {note.title || "Không có tiêu đề"}
                </h3>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
                {/* Note body */}
                <p className="text-gray-700 text-sm line-clamp-4 whitespace-pre-wrap">
                    {note.body}
                </p>

                {/* Image preview */}
                {note.image_id && (
                    <div className="mt-3" data-image>
                        {imageLoading ? (
                            <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        ) : imageData ? (
                            <div
                                className="relative w-full rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-gray-50"
                                style={{ aspectRatio: '16/10' }}
                                onClick={handleImageClick}
                            >
                                <Image
                                    src={imageData.url}
                                    alt="Note image"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                <span className="ml-2 text-sm text-gray-500">Không thể tải ảnh</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 mt-3">
                    {format(new Date(note.updated_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                </div>
            </CardContent>
        </Card>
    );
}
