"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData, Role } from "@/types";

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
                subscriptionExpiry: status === 'active' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : 0
            });
            setUsers(users.map(u => u.uid === uid ? { ...u, subscriptionStatus: status } : u));
        } catch (error) {
            console.error("Update failed", error);
            alert("Update failed");
        }
    };

    const handlePromoteAdmin = async (uid: string, currentRole: Role) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'Promote to Admin' : 'Remove Admin Access';

        if (!confirm(`Are you sure you want to ${action} for this user?`)) return;

        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Role update failed", error);
            alert("Failed to update role");
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
    if (isAdmin === false) return null;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center border-b border-gray-700 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <span className="bg-red-600 text-xs px-2 py-1 rounded text-white uppercase tracking-wider">Super Admin</span>
                            Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Manage users, subscriptions, and admin roles.</p>
                    </div>
                    <button onClick={fetchUsers} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">Refresh Data</button>
                </header>

                {loading ? (
                    <div className="text-center py-10 text-gray-400">Loading users...</div>
                ) : (
                    <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subscription</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.uid} className="hover:bg-gray-750 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">{user.email}</div>
                                            <div className="text-xs text-gray-500">UID: {user.uid}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-900 text-purple-200 border border-purple-700' : 'bg-gray-700 text-gray-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-900 text-green-200 border border-green-700' : 'bg-red-900 text-red-200 border border-red-700'
                                                }`}>
                                                {user.subscriptionStatus}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                                            {/* Role Management */}
                                            <button
                                                onClick={() => handlePromoteAdmin(user.uid, user.role)}
                                                className={`text-xs px-2 py-1 rounded border ${user.role === 'admin' ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-purple-600 text-purple-400 hover:bg-purple-900'}`}
                                            >
                                                {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                                            </button>

                                            {/* Subscription Management */}
                                            {user.subscriptionStatus !== 'active' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.uid, 'active')}
                                                    className="text-green-400 hover:text-green-300"
                                                >
                                                    Activate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.uid, 'expired')}
                                                    className="text-orange-400 hover:text-orange-300"
                                                >
                                                    Expire
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="text-red-500 hover:text-red-400 ml-2"
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
