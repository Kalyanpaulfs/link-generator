"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore'; // Using setDoc for custom ID if needed, but collection.add is better for auto-id
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { nanoid } from 'nanoid';

interface CreateLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Refresh list
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

            const slug = nanoid(7); // Generate 7-char slug
            const now = Date.now();

            // Create Link Doc
            await addDoc(collection(db, "links"), {
                slug,
                userId: user.uid,
                whatsappNumber: whatsapp,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden transform transition-all scale-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Link</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Enter a WhatsApp number including the country code (e.g., 15551234567).
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="WhatsApp Number"
                        placeholder="e.g. 15559998888"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        type="tel"
                        required
                        autoFocus
                    />

                    {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Link"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
