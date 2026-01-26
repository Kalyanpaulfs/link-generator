"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // Import auth directly to be sure
import { LinkData } from "@/types";
import { Button } from "@/components/ui/Button";
import { CreateLinkModal } from "@/components/dashboard/CreateLinkModal";
import { LinkCard } from "@/components/dashboard/LinkCard";

export default function DashboardPage() {
    const { user, loading } = useRequireAuth();
    const [links, setLinks] = useState<LinkData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Real-time listener
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "links"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const linksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LinkData[];
            // Sort by newest
            setLinks(linksData.sort((a, b) => b.createdAt - a.createdAt));
        });

        return () => unsubscribe();
    }, [user]);

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, "links", id), {
                active: !current
            });
        } catch (e) {
            console.error(e);
            alert("Failed to update status");
        }
    };

    const handleUpdate = async (id: string, newNumber: string) => {
        try {
            await updateDoc(doc(db, "links", id), {
                whatsappNumber: newNumber
            });
        } catch (e) {
            console.error(e);
            alert("Failed to update number");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Links</h1>
                    <p className="text-gray-500 mt-1">Manage all your WhatsApp redirects here.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Create New Link
                </Button>
            </div>

            {/* Grid */}
            {links.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No links yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new redirect link.</p>
                    <div className="mt-6">
                        <Button onClick={() => setIsModalOpen(true)}>Create Link</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map(link => (
                        <LinkCard
                            key={link.id}
                            link={link}
                            onDelete={() => { }}
                            onToggle={handleToggle}
                            onUpdate={handleUpdate}
                        />
                    ))}
                </div>
            )}

            <CreateLinkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { }} // Listener handles it
            />
        </div>
    );
}
