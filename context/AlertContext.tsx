"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertModal, PromptModal } from "@/components/ui/Modal";

interface AlertOptions {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "info" | "success" | "warning" | "error";
    placeholder?: string;
    defaultValue?: string;
}

interface AlertContextType {
    showAlert: (message: string, options?: AlertOptions) => void;
    showConfirm: (message: string, onConfirm: () => void, options?: AlertOptions) => void;
    showPrompt: (message: string, onConfirm: (value: string) => void, options?: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{
        isOpen: boolean;
        isPromptOpen: boolean;
        message: string;
        title: string;
        type: "info" | "success" | "warning" | "error";
        isConfirm: boolean;
        confirmText: string;
        cancelText: string;
        placeholder?: string;
        defaultValue?: string;
        onConfirm?: (value?: any) => void;
    }>({
        isOpen: false,
        isPromptOpen: false,
        message: "",
        title: "Notification",
        type: "info",
        isConfirm: false,
        confirmText: "OK",
        cancelText: "Cancel",
    });

    const showAlert = useCallback((message: string, options?: AlertOptions) => {
        setState({
            isOpen: true,
            isPromptOpen: false,
            message,
            title: options?.title || "Notification",
            type: options?.type || "info",
            isConfirm: false,
            confirmText: options?.confirmText || "OK",
            cancelText: "Cancel",
        });
    }, []);

    const showConfirm = useCallback((message: string, onConfirm: () => void, options?: AlertOptions) => {
        setState({
            isOpen: true,
            isPromptOpen: false,
            message,
            title: options?.title || "Confirm Action",
            type: options?.type || "warning",
            isConfirm: true,
            confirmText: options?.confirmText || "Confirm",
            cancelText: options?.cancelText || "Cancel",
            onConfirm,
        });
    }, []);

    const showPrompt = useCallback((message: string, onConfirm: (value: string) => void, options?: AlertOptions) => {
        setState({
            isOpen: false,
            isPromptOpen: true,
            message,
            title: options?.title || "Input Required",
            type: "info",
            isConfirm: false,
            confirmText: options?.confirmText || "Submit",
            cancelText: options?.cancelText || "Cancel",
            placeholder: options?.placeholder,
            defaultValue: options?.defaultValue,
            onConfirm,
        });
    }, []);

    const close = () => setState((prev) => ({ ...prev, isOpen: false, isPromptOpen: false }));

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
            {children}
            <AlertModal
                isOpen={state.isOpen}
                onClose={close}
                title={state.title}
                message={state.message}
                type={state.type}
                isConfirm={state.isConfirm}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                onConfirm={state.onConfirm}
            />
            <PromptModal
                isOpen={state.isPromptOpen}
                onClose={close}
                title={state.title}
                message={state.message}
                onConfirm={(val) => state.onConfirm?.(val)}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                placeholder={state.placeholder}
                defaultValue={state.defaultValue}
            />
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error("useAlerts must be used within an AlertProvider");
    }
    return context;
}
