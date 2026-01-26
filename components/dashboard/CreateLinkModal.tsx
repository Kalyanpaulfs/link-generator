"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { nanoid } from 'nanoid';

interface CreateLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateLinkModal({ isOpen, onClose, onSuccess }: CreateLinkModalProps) {
    const { user } = useAuth();
    const [whatsapp, setWhatsapp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            // Basic validation
            if (!whatsapp.trim()) throw new Error("WhatsApp number is required");

            const slug = nanoid(7);
            const now = Date.now();

            await addDoc(collection(db, "links"), {
                slug,
                userId: user.uid,
                whatsappNumber: whatsapp.replace(/[^\d+]/g, ''), // Clean up number
                active: true,
                clicks: 0,
                createdAt: now
            });

            setWhatsapp('');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Create New Link</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter a WhatsApp number to generate a short link.
                    </p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="WhatsApp Number"
                            placeholder="e.g. 15551234567"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            type="tel"
                            required
                            autoFocus
                            className="text-lg tracking-wide"
                        />
                        <p className="text-xs text-gray-400 -mt-2">Include country code, no spaces or dashes.</p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-6 shadow-lg shadow-indigo-500/20">
                                {loading ? "Creating..." : "Create Link"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
