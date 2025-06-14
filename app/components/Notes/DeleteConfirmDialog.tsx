"use client";

import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    noteTitle: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    noteTitle,
    isDeleting = false,
}: DeleteConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        // Don't call onClose() here - the parent component handles dialog state cleanup
    };

    const handleCancel = () => {
        if (!isDeleting) {
            onClose();
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isDeleting) {
            onClose();
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa ghi chú</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa ghi chú "{noteTitle || "Không có tiêu đề"}"?
                        Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Đang xóa...
                            </>
                        ) : (
                            "Xóa"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
