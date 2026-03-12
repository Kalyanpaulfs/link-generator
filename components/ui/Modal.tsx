
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "md",
}: ModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all`}>
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 text-gray-600">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    isConfirm?: boolean;
}

export function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel",
    isConfirm = false,
}: AlertModalProps) {
    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    const footer = (
        <>
            <Button onClick={handleConfirm} variant={type === "error" ? "danger" : "primary"}>
                {confirmText}
            </Button>
            {isConfirm && (
                <Button onClick={onClose} variant="outline">
                    {cancelText}
                </Button>
            )}
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
            <p className="text-gray-600 leading-relaxed text-sm">
                {message}
            </p>
        </Modal>
    );
}

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    onConfirm: (value: string) => void;
    confirmText?: string;
    cancelText?: string;
    placeholder?: string;
    defaultValue?: string;
}

export function PromptModal({
    isOpen,
    onClose,
    title,
    message,
    onConfirm,
    confirmText = "Submit",
    cancelText = "Cancel",
    placeholder = "Enter value...",
    defaultValue = "",
}: PromptModalProps) {
    const [value, setValue] = React.useState(defaultValue);

    React.useEffect(() => {
        if (isOpen) setValue(defaultValue);
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        onConfirm(value);
        onClose();
    };

    const footer = (
        <>
            <Button onClick={handleConfirm} disabled={!value.trim()}>
                {confirmText}
            </Button>
            <Button onClick={onClose} variant="outline">
                {cancelText}
            </Button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
            <p className="text-gray-600 mb-4 text-sm font-medium">
                {message}
            </p>
            <input
                type="text"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && value.trim()) handleConfirm();
                }}
            />
        </Modal>
    );
}
