"use client";

import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Save,
    Upload,
    FileText,
    AlertCircle,
    Loader2
} from "lucide-react";
import { uploadBook } from "@/db/books";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BookUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentUser: IUser;
    isAdmin: boolean;
}

export default function BookUploadModal({
    isOpen,
    onClose,
    onSuccess,
    currentUser,
    isAdmin
}: BookUploadModalProps) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [uploading, setUploading] = useState(false);

    const supabase = createClient();

    const resetForm = () => {
        setTitle("");
        setAuthor("");
        setDescription("");
        setFile(null);
        setIsPublic(false);
    };

    const handleClose = () => {
        if (!uploading) {
            resetForm();
            onClose();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const allowedTypes = [
                'text/plain',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                toast({
                    title: "Lỗi",
                    description: "Chỉ hỗ trợ file .txt, .pdf, .doc, .docx",
                    variant: "destructive",
                });
                return;
            }

            // Auto-fill title from filename if empty
            if (!title) {
                const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
                setTitle(fileName);
            }

            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn file để tải lên.",
                variant: "destructive",
            });
            return;
        }

        if (!title.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên sách.",
                variant: "destructive",
            });
            return;
        }

        // Only admin can upload to public library
        if (isPublic && !isAdmin) {
            toast({
                title: "Lỗi",
                description: "Chỉ admin mới có thể tải sách lên thư viện công khai.",
                variant: "destructive",
            });
            return;
        }

        try {
            setUploading(true);

            const result = await uploadBook(supabase, currentUser.user_id, {
                title: title.trim(),
                author: author.trim() || undefined,
                description: description.trim() || undefined,
                file,
                is_public: isPublic
            });

            if (result.success) {
                onSuccess();
                resetForm();
            } else {
                throw new Error(result.error || "Không thể tải sách lên");
            }
        } catch (error) {
            console.error("Error uploading book:", error);
            toast({
                title: "Lỗi",
                description: error instanceof Error ? error.message : "Có lỗi xảy ra khi tải sách lên.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 w-full">
                <DialogHeader>
                    <DialogTitle>Tải sách lên</DialogTitle>
                    <DialogDescription>
                        Thêm sách mới vào thư viện của bạn
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden w-full">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">File sách *</Label>
                        <div className="w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('file-upload')?.click()}
                                disabled={uploading}
                                className="w-full justify-start min-w-0"
                            >
                                <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate" title={file?.name}>
                                    {file ? (file.name.length > 30 ? file.name.substring(0, 30) + "..." : file.name) : "Chọn file"}
                                </span>
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".txt,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        {file && (
                            <div className="flex items-center text-sm text-gray-600 truncate">
                                <FileText size={14} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{formatFileSize(file.size)}</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Tên sách * (tối đa 50 ký tự)</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 50) {
                                    setTitle(value);
                                }
                            }}
                            placeholder="Nhập tên sách"
                            disabled={uploading}
                            className="w-full"
                            maxLength={50}
                        />
                        <div className="text-xs text-gray-500 text-right">
                            {title.length}/50
                        </div>
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                        <Label htmlFor="author">Tác giả (tối đa 50 ký tự)</Label>
                        <Input
                            id="author"
                            value={author}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 50) {
                                    setAuthor(value);
                                }
                            }}
                            placeholder="Nhập tên tác giả"
                            disabled={uploading}
                            className="w-full"
                            maxLength={50}
                        />
                        <div className="text-xs text-gray-500 text-right">
                            {author.length}/50
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả (tối đa 200 ký tự)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 200) {
                                    setDescription(value);
                                }
                            }}
                            placeholder="Mô tả ngắn về cuốn sách"
                            rows={3}
                            disabled={uploading}
                            className="w-full resize-none"
                            maxLength={200}
                        />
                        <div className="text-xs text-gray-500 text-right">
                            {description.length}/200
                        </div>
                    </div>

                    {/* Public/Private */}
                    {isAdmin && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is-public"
                                checked={isPublic}
                                onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                                disabled={uploading}
                            />
                            <Label htmlFor="is-public" className="text-sm">
                                Tải lên thư viện công khai
                            </Label>
                        </div>
                    )}

                    {/* Admin Notice */}
                    {!isAdmin && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Sách sẽ được tải lên thư viện cá nhân của bạn. 
                                Chỉ admin mới có thể tải sách lên thư viện công khai.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !file || !title.trim()}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang tải lên...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Tải lên
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
