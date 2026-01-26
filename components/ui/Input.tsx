import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm placeholder-gray-400 py-2.5 px-3 transition-colors ${error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                        } ${className}`}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
