"use client";


import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { LinkData } from "@/types";
import { Button } from "@/components/ui/Button";
import { CreateLinkModal } from "@/components/dashboard/CreateLinkModal";
import { LinkCard } from "@/components/dashboard/LinkCard";
import { Card, CardContent } from "@/components/ui/Card";
import { BarChart3, Link as LinkIcon, Star } from "lucide-react";

export default function DashboardPage() {
    const { user, loading } = useRequireAuth();
    const [links, setLinks] = useState<LinkData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Subscription Check
    const [subStatus, setSubStatus] = useState<'none' | 'pending' | 'active' | 'expired'>('none');
    const [subLoading, setSubLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Fetch Links
        const qLinks = query(
            collection(db, "links"),
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

        // Fetch Subscriptions (existing logic)
        const qSubs = query(
            collection(db, "subscriptions"),
            where("userId", "==", user.uid)
        );

        const unsubscribeSubs = onSnapshot(qSubs, (snapshot) => {
            if (snapshot.empty) {
                setSubStatus('none');
            } else {
                const subs = snapshot.docs.map(d => d.data());
                subs.sort((a, b) => b.createdAt - a.createdAt);

                const latest = subs[0];
                setSubStatus(latest.status as any);
            }
            setSubLoading(false);
        });

        return () => {
            unsubscribeLinks();
            unsubscribeSubs();
        };
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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this link?")) return;
        try {
            await deleteDoc(doc(db, "links", id));
        } catch (e) {
            console.error(e);
            alert("Failed to delete link");
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

    const isPending = subStatus === 'pending';
    const isActive = subStatus === 'active';

    if (loading || subLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

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
                    disabled={isPending || !isActive} // Only active users can create
                >
                    + Create New Link
                </Button>
            </div>

            {/* Pending Payment Banner */}
            {isPending && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {/* Icon */}
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong className="font-medium">Payment Under Review.</strong> Your subscription is currently being verified by an admin. You will be notified once it is approved. Link creation is paused until then.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* No Active Plan Banner */}
            {!isPending && !isActive && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                <strong className="font-medium">No Active Plan.</strong> Please select a plan to start creating links.
                                <a href="/plans" className="ml-2 font-bold underline hover:text-red-800">View Plans</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}


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
                                disabled={isPending || !isActive}
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
