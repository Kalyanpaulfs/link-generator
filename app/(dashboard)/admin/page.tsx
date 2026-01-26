"use client";

import { useEffect, useState } from "react";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/types";
import { Button } from "@/components/ui/Button";

export default function AdminPage() {
    const { userData, loading } = useUserData();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Guard: Redirect if not admin
    useEffect(() => {
        if (!loading && (!userData || userData.role !== 'admin')) {
            router.push("/dashboard");
        }
    }, [userData, loading, router]);

    // Fetch all users
    useEffect(() => {
        if (userData?.role === 'admin') {
            fetchUsers();
        }
    }, [userData]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const snap = await getDocs(collection(db, "users"));
            const data = snap.docs.map(d => d.data() as UserData);
            setUsers(data);
        } catch (e) {
            console.error(e);
            alert("Failed to fetch users");
        } finally {
            setLoadingUsers(false);
        }
    };

    const updateUserStatus = async (uid: string, status: 'active' | 'expired' | 'trial') => {
        try {
            await updateDoc(doc(db, "users", uid), {
                subscriptionStatus: status,
                // If active, extend expiry by 30 days (mock logic for now)
                subscriptionExpiry: status === 'active' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now()
            });
            fetchUsers(); // Refresh
        } catch (e) {
            console.error(e);
            alert("Failed to update user");
        }
    };

    if (loading || !userData || userData.role !== 'admin') {
        return <div className="p-8 text-center text-gray-500">Checking permissions...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <Button onClick={fetchUsers} variant="secondary">Refresh</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.uid}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                     ${u.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                                            u.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                        {u.subscriptionStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(u.subscriptionExpiry).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                    <button onClick={() => updateUserStatus(u.uid, 'active')} className="text-indigo-600 hover:text-indigo-900">Activate</button>
                                    <button onClick={() => updateUserStatus(u.uid, 'expired')} className="text-red-600 hover:text-red-900">Expire</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
