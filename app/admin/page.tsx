"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/types";

export default function AdminPage() {
    const { isAdmin } = useAdmin();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers: UserData[] = [];
            querySnapshot.forEach((doc) => {
                fetchedUsers.push(doc.data() as UserData);
            });
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Failed to fetch users. Check console.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const handleUpdateStatus = async (uid: string, status: 'active' | 'expired') => {
        if (!confirm(`Set user status to ${status}?`)) return;
        try {
            await updateDoc(doc(db, "users", uid), {
                subscriptionStatus: status,
                subscriptionExpiry: status === 'active' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : 0 // 30 days or 0
            });
            // Optimistic update
            setUsers(users.map(u => u.uid === uid ? { ...u, subscriptionStatus: status } : u));
        } catch (error) {
            console.error("Update failed", error);
            alert("Update failed");
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, "users", uid));
            setUsers(users.filter(u => u.uid !== uid));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Delete failed");
        }
    };

    if (isAdmin === null) return <div className="p-10 text-center">Checking Permissions...</div>;
    if (isAdmin === false) return null; // Redirect handled in hook

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Refresh</button>
                </header>

                {loading ? (
                    <div className="text-center py-10">Loading users...</div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.uid}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {user.subscriptionStatus !== 'active' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.uid, 'active')}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Activate
                                                </button>
                                            )}
                                            {user.subscriptionStatus === 'active' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.uid, 'expired')}
                                                    className="text-orange-600 hover:text-orange-900"
                                                >
                                                    Expire
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="text-red-600 hover:text-red-900 ml-4"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
