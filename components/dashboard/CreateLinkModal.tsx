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
    const [whatsapp, setWhatsapp] = useState('+91'); // Default to +91
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("CreateLinkModal: handleSubmit triggered");
        if (!user) {
            console.error("CreateLinkModal: No user found");
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log("CreateLinkModal: Validating input", whatsapp);

            if (!whatsapp.trim()) throw new Error("WhatsApp number is required");

            // Clean input: ensure it starts with +, remove spaces/dashes for validation
            let cleanNumber = whatsapp.trim().replace(/[\s-]/g, '');

            if (!cleanNumber.startsWith('+')) {
                // Auto-add + if missing but user typed country code? 
                // Or force user to type it. The user said "editable" prefix.
                // Let's assume user might delete everything.
                if (/^\d/.test(cleanNumber)) {
                    cleanNumber = '+' + cleanNumber;
                } else {
                    throw new Error("Number must include country code (e.g. +91)");
                }
            }

            // Extract digits only
            const digitsOnly = cleanNumber.replace(/\D/g, '');

            // Validation logic
            // User requested: "10 digits mandatory" (implied for subscriber number)
            // Specific check for +91 (India) which is the default/requested example
            if (cleanNumber.startsWith('+91')) {
                if (digitsOnly.length !== 12) { // 91 + 10 digits = 12
                    const currentDigits = digitsOnly.length > 2 ? digitsOnly.length - 2 : 0;
                    throw new Error(`For +91, number must be exactly 10 digits. You entered ${currentDigits}.`);
                }
            } else {
                // Generic safety check: Phone numbers are generally 7-15 digits
                if (digitsOnly.length < 8 || digitsOnly.length > 15) {
                    throw new Error("Invalid phone number length.");
                }
            }

            const slug = nanoid(7);
            const now = Date.now();

            console.log("CreateLinkModal: Attempting addDoc", { slug, userId: user.uid, whatsapp: cleanNumber });

            await addDoc(collection(db, "links"), {
                slug,
                userId: user.uid,
                whatsappNumber: cleanNumber,
                customMessage: message.trim(),
                active: true,
                clicks: 0,
                createdAt: now
            });

            console.log("CreateLinkModal: Success");

            console.log("CreateLinkModal: Success");

            setWhatsapp('+91'); // Reset to default
            setMessage('');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("CreateLinkModal: Error", err);
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
                            placeholder="Example: +91 9876543210"
                            value={whatsapp}
                            onChange={(e) => {
                                const val = e.target.value;
                                // Strictly allow only digits, +, space, and dashes. No alphabets.
                                if (/^[0-9+\s-]*$/.test(val)) {
                                    // Limit length logic
                                    // If starts with +91, max 12 digits total (+91 9876543210)
                                    const digits = val.replace(/\D/g, '');
                                    if (val.startsWith('+91') && digits.length > 12) return;

                                    // General max safety limit
                                    if (digits.length > 15) return;

                                    setWhatsapp(val);
                                }
                            }}
                            type="tel"
                            required
                            autoFocus
                            className="text-lg tracking-wide"
                        />
                        <p className="text-xs text-gray-400 -mt-2">Include country code, no spaces or dashes.</p>

                        <p className="text-xs text-gray-400 -mt-2">Include country code, no spaces or dashes.</p>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Custom Message (Optional)</label>
                            <textarea
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm placeholder-gray-400 py-2.5 px-3 transition-colors min-h-[80px]"
                                placeholder="Hello, I'm interested in your services..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <p className="text-xs text-gray-400">This message will be pre-filled when users click your link.</p>
                        </div>

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
