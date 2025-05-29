"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Palette,
    Pin,
    PinOff
} from "lucide-react";
import { CreateNoteData, UpdateNoteData } from "@/db/notes";
import { uploadUserImage } from "@/db/images";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateNoteData | UpdateNoteData) => void;
    mode: "create" | "edit";
    note?: INote;
    currentUser: IUser;
}

// Color palette for notes
const NOTE_COLORS = [
    { value: "#ffffff", name: "Trắng", class: "bg-white border-gray-300" },
    { value: "#fef3c7", name: "Vàng", class: "bg-yellow-100 border-yellow-300" },
    { value: "#dbeafe", name: "Xanh dương", class: "bg-blue-100 border-blue-300" },
    { value: "#dcfce7", name: "Xanh lá", class: "bg-green-100 border-green-300" },
    { value: "#fce7f3", name: "Hồng", class: "bg-pink-100 border-pink-300" },
    { value: "#f3e8ff", name: "Tím", class: "bg-purple-100 border-purple-300" },
    { value: "#fed7d7", name: "Đỏ", class: "bg-red-100 border-red-300" },
    { value: "#e0f2fe", name: "Xanh cyan", class: "bg-cyan-100 border-cyan-300" },
];

export default function NoteModal({
    isOpen,
    onClose,
    onSave,
    mode,
    note,
    currentUser,
}: NoteModalProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [isPinned, setIsPinned] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageId, setExistingImageId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    // Initialize form data
    useEffect(() => {
        if (mode === "edit" && note) {
            setTitle(note.title || "");
            setBody(note.body || "");
            setColor(note.color || "#ffffff");
            setIsPinned(note.is_pinned === true);
            setExistingImageId(note.image_id || null);

            // Load existing image preview
            if (note.image_id) {
                loadExistingImage(note.image_id);
            }
        } else {
            // Reset for create mode
            setTitle("");
            setBody("");
            setColor("#ffffff");
            setIsPinned(false);
            setImageFile(null);
            setImagePreview(null);
            setExistingImageId(null);
        }
    }, [mode, note, isOpen]);

    const loadExistingImage = async (imageId: string) => {
        try {
            const { data } = await supabase.storage
                .from("images")
                .createSignedUrl(`private/${currentUser.user_id}/${imageId}`, 3600);

            if (data?.signedUrl) {
                setImagePreview(data.signedUrl);
            }
        } catch (error) {
            console.error("Error loading existing image:", error);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Lỗi",
                    description: "Vui lòng chọn file hình ảnh.",
                    variant: "destructive",
                });
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Clear existing image
            setExistingImageId(null);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageId(null);
    };

    const handleSave = async () => {
        if (!title.trim() && !body.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề hoặc nội dung.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);

        try {
            let finalImageId = existingImageId;

            // Upload new image if selected
            if (imageFile) {
                setUploading(true);
                const uploadResult = await uploadUserImage(
                    supabase,
                    currentUser.user_id,
                    imageFile
                );

                if (uploadResult.success && uploadResult.path) {
                    // Extract filename from path
                    finalImageId = uploadResult.path.split('/').pop() || null;
                } else {
                    throw new Error(uploadResult.error || "Failed to upload image");
                }
                setUploading(false);
            }

            const noteData = {
                title: title.trim(),
                body: body.trim(),
                color,
                is_pinned: isPinned,
                image_id: finalImageId,
            };

            await onSave(noteData);
        } catch (error) {
            console.error("Error saving note:", error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu ghi chú. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Tạo ghi chú mới" : "Chỉnh sửa ghi chú"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Tạo một ghi chú mới với tiêu đề, nội dung và hình ảnh."
                            : "Chỉnh sửa thông tin ghi chú của bạn."
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input
                            id="title"
                            placeholder="Nhập tiêu đề ghi chú..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <Label htmlFor="body">Nội dung</Label>
                        <Textarea
                            id="body"
                            placeholder="Nhập nội dung ghi chú..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={6}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Hình ảnh</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('image-upload')?.click()}
                                disabled={uploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Chọn hình ảnh
                            </Button>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            {imagePreview && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-gray-50">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={false}
                                />
                            </div>
                        )}
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-2">
                        <Label>Màu sắc</Label>
                        <div className="flex flex-wrap gap-2">
                            {NOTE_COLORS.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${colorOption.class} ${
                                        color === colorOption.value
                                            ? 'ring-2 ring-yellow-500 ring-offset-2'
                                            : 'hover:scale-110'
                                    } transition-all`}
                                    onClick={() => setColor(colorOption.value)}
                                    title={colorOption.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Pin Toggle */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={isPinned ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsPinned(!isPinned)}
                        >
                            {isPinned ? (
                                <>
                                    <PinOff className="h-4 w-4 mr-2" />
                                    Bỏ ghim
                                </>
                            ) : (
                                <>
                                    <Pin className="h-4 w-4 mr-2" />
                                    Ghim ghi chú
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || uploading}
                            className="bg-yellow-500 hover:bg-yellow-400"
                        >
                            {saving || uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    {uploading ? "Đang tải ảnh..." : "Đang lưu..."}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
