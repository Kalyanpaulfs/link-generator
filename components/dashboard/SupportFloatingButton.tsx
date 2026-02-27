"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export function SupportFloatingButton() {
    const PHILOSOPHY_WHATSAPP = "917004516415";
    const message = encodeURIComponent("Hi LinkGen Support, I need help with my account.");

    return (
        <a
            href={`https://wa.me/${PHILOSOPHY_WHATSAPP}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group"
            title="Contact Support on WhatsApp"
        >
            <MessageCircle className="w-7 h-7" />

            {/* Tooltip */}
            <span className="absolute right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-medium whitespace-nowrap shadow-xl">
                Need Help? Chat with us
            </span>

            {/* Notification pulse (Subtle) */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
            </span>
        </a>
    );
}
