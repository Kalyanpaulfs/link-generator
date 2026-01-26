"use client";

import { useState } from "react";
import { LinkData } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

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
        // Toast notification would be better here
        alert("Link copied!");
    };

    const handleSave = () => {
        onUpdate(link.id!, editNumber);
        setIsEditing(false);
    };

    return (
        <Card className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-400">/w/</span>
                            <h3 className="font-bold text-lg text-gray-900 tracking-tight">
                                {link.slug}
                            </h3>
                        </div>


                        {isEditing ? (
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    value={editNumber}
                                    onChange={(e) => setEditNumber(e.target.value)}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none w-32 transition-all"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSave}
                                    className="text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-gray-800 transition font-medium"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group min-h-[28px]">
                                <p className="text-sm text-gray-500 font-medium truncate max-w-[150px]">
                                    +{link.whatsappNumber}
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 hover:text-indigo-600"
                                    title="Edit Number"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <Badge variant={link.active ? 'success' : 'neutral'}>
                        {link.active ? 'Active' : 'Paused'}
                    </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={copyToClipboard} className="h-8 text-xs font-medium">
                            Copy
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onToggle(link.id!, link.active)} className="h-8 text-xs text-gray-500">
                            {link.active ? 'Pause' : 'Resume'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(link.id!)} className="h-8 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50">
                            Delete
                        </Button>
                    </div>

                    <div className="text-xs font-medium text-gray-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        {link.clicks || 0}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
