
"use client";

import React from "react";
import { AlertProvider } from "@/context/AlertContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AlertProvider>
            {children}
        </AlertProvider>
    );
}
