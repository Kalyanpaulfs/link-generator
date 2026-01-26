import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "error" | "neutral" | "info";
    size?: "sm" | "md";
}

export function Badge({
    className = "",
    variant = "neutral",
    size = "md",
    children,
    ...props
}: BadgeProps) {
    const variants = {
        success: "bg-green-50 text-green-700 border border-green-200 ring-1 ring-green-600/10",
        warning: "bg-orange-50 text-orange-700 border border-orange-200 ring-1 ring-orange-600/10",
        error: "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-600/10",
        neutral: "bg-gray-50 text-gray-600 border border-gray-200 ring-1 ring-gray-600/10",
        info: "bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-600/10",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs font-medium",
        md: "px-2.5 py-0.5 text-sm font-medium",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
