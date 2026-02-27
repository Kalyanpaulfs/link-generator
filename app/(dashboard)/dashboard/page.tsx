"use client";


import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole"; // Import new hook
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getDb, getClientAuth } from "@/lib/firebase";
import { LinkData } from "@/types";
import { Button } from "@/components/ui/Button";
import { CreateLinkModal } from "@/components/dashboard/CreateLinkModal";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { Card, CardContent } from "@/components/ui/Card";
import { BarChart3, Link as LinkIcon, Star } from "lucide-react";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";


export default function DashboardPage() {
    const { user, loading } = useRequireAuth();
    const { userData, loading: roleLoading, isAdmin } = useRole(); // Use central hook
    const [links, setLinks] = useState<LinkData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Fetch Links
        const qLinks = query(
            collection(getDb(), "links"),
            where("userId", "==", user.uid)
        );

        const unsubscribeLinks = onSnapshot(qLinks, (snapshot) => {
            const fetchedLinks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as LinkData[];
            // Sort by createdAt desc
            fetchedLinks.sort((a, b) => b.createdAt - a.createdAt);
            setLinks(fetchedLinks);
        });

        return () => {
            unsubscribeLinks();
        };
    }, [user]);

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(getDb(), "links", id), {
                active: !current
            });
        } catch (e) {
            console.error(e);
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this link?")) return;
        try {
            await deleteDoc(doc(getDb(), "links", id));
        } catch (e) {
            console.error(e);
            alert("Failed to delete link");
        }
    };

    const handleUpdate = async (id: string, newNumber: string, newMessage?: string) => {
        try {
            await updateDoc(doc(getDb(), "links", id), {
                whatsappNumber: newNumber,
                customMessage: newMessage
            });
        } catch (e) {
            console.error(e);
            alert("Failed to update link");
        }
    };

    const status = userData?.subscriptionStatus;
    const isPending = status === 'pending';
    const isActive = status === 'active';
    const isTrial = status === 'trial';

    // Logic: Active users can always create. Trial users can create only if they have < 1 link. Admins can always create.
    const canCreateLink = isAdmin || (!isPending && (isActive || (isTrial && links.length < 1)));

    if (loading || roleLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
    const activeLinks = links.filter(l => l.active).length;

    return (
        <div className="space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage links and view performance.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="shadow-lg shadow-indigo-500/20"
                    disabled={!canCreateLink}
                >
                    + Create New Link
                </Button>
            </div>

            {/* Subscription Status Card */}
            <SubscriptionStatus userData={userData} />



            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                            <h3 className="text-2xl font-bold text-gray-900">{totalClicks}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Links</p>
                            <h3 className="text-2xl font-bold text-gray-900">{activeLinks}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Links</p>
                            <h3 className="text-2xl font-bold text-gray-900">{links.length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Links Grid */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Links</h2>
                {links.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                            <LinkIcon className="w-6 h-6" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No links yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new redirect link.</p>
                        <div className="mt-6">
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                disabled={!canCreateLink}
                            >
                                Create Link
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {links.map(link => (
                            <LinkCard
                                key={link.id}
                                link={link}
                                onDelete={() => handleDelete(link.id!)}
                                onToggle={handleToggle}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CreateLinkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { }} // Listener handles it
            />
        </div>
    );
}
