"use client";

import { useState } from "react";
import { LinkData } from "@/types";
import { Button } from "@/components/ui/Button";

interface LinkCardProps {
    link: LinkData;
    onDelete: (id: string) => void;
    onToggle: (id: string, current: boolean) => void;
    onUpdate: (id: string, newNumber: string) => void;
}

export function LinkCard({ link, onDelete, onToggle, onUpdate }: LinkCardProps) {
    const fullUrl = `${window.location.origin}/w/${link.slug}`;
    const [isEditing, setIsEditing] = useState(false);
    const [editNumber, setEditNumber] = useState(link.whatsappNumber);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullUrl);
        alert("Copied to clipboard!");
    };

    const handleSave = () => {
        onUpdate(link.id!, editNumber);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-mono text-lg font-semibold text-indigo-600 tracking-tight">
                        /{link.slug}
                    </h3>

                    {isEditing ? (
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="text"
                                value={editNumber}
                                onChange={(e) => setEditNumber(e.target.value)}
                                className="px-2 py-1 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500/20 outline-none w-32"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 group h-7">
                            To: <span className="font-medium text-gray-700">+{link.whatsappNumber}</span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 text-xs hover:underline font-medium"
                            >
                                Edit
                            </button>
                        </p>
                    )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${link.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {link.active ? 'Active' : 'Disabled'}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={copyToClipboard}>
                        Copy
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onToggle(link.id!, link.active)}>
                        {link.active ? 'Disable' : 'Enable'}
                    </Button>
                </div>

                <div className="text-sm text-gray-400">
                    {link.clicks || 0} clicks
                </div>
            </div>
        </div>
    );
}
