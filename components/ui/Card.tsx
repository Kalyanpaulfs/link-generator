import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
    return (
        <div
            className={`bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className = "", children, ...props }: CardProps) {
    return (
        <div className={`px-6 py-4 border-b border-gray-50 ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className = "", children, ...props }: CardProps) {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 leading-tight ${className}`} {...props}>
            {children}
        </h3>
    );
}

export function CardContent({ className = "", children, ...props }: CardProps) {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
}
