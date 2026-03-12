"use client";

import { useAdmin } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { getDb, getClientAuth } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { UserData, Role } from "@/types";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Shield, ShieldOff, Check, X, Trash2, Eye, UserCircle } from "lucide-react";
import { isProtected } from "@/lib/constants";
import { approvePayment, rejectPayment, updateUserRole, impersonateUser } from "@/app/actions/admin";
import { useAlerts } from "@/context/AlertContext";

export default function AdminPage() {
    const { isAdmin, isSuperAdmin } = useAdmin();
    const router = useRouter();
    const { showAlert, showConfirm, showPrompt } = useAlerts();
    const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'settings'>('payments');
    const [users, setUsers] = useState<UserData[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [settings, setSettings] = useState({ upiId: '', qrCodeUrl: '', supportNumber: '', supportMessage: '' });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const querySnapshot = await getDocs(collection(getDb(), "users"));
                const fetchedUsers: UserData[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedUsers.push(doc.data() as UserData);
                });
                setUsers(fetchedUsers);
            } else if (activeTab === 'payments') {
                const querySnapshot = await getDocs(collection(getDb(), "payments"));
                const fetchedPayments: any[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.status === 'pending') {
                        fetchedPayments.push({ id: doc.id, ...data });
                    }
                });
                setPayments(fetchedPayments);
            } else if (activeTab === 'settings') {
                const docSnap = await getDoc(doc(getDb(), "settings", "global"));
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as any);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            showAlert("Failed to fetch data.", { type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, activeTab]);

    const handleUpdateStatus = async (uid: string, status: 'active' | 'expired') => {
        showConfirm(`Set user status to ${status}?`, async () => {
            try {
                await updateDoc(doc(getDb(), "users", uid), {
                    subscriptionStatus: status,
                    subscriptionExpiry: status === 'active' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : 0
                });
                setUsers(users.map(u => u.uid === uid ? { ...u, subscriptionStatus: status } : u));
            } catch (error) {
                console.error("Update failed", error);
                showAlert("Update failed", { type: "error" });
            }
        });
    };

    const handlePromoteAdmin = async (uid: string, currentRole: Role, email: string) => {
        if (isProtected(email) && currentRole === 'admin') {
            showAlert("This is a protected admin account and cannot be demoted.", { type: "error" });
            return;
        }

        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'Promote to Admin' : 'Remove Admin Access';

        showConfirm(`Are you sure you want to ${action} for this user?`, async () => {
            try {
                const result = await updateUserRole(uid, newRole);
                if (result.success) {
                    setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
                } else {
                    showAlert(result.error || "Failed to update role", { type: "error" });
                }
            } catch (error) {
                console.error("Role update failed", error);
                showAlert("Failed to update role", { type: "error" });
            }
        });
    };

    const handleDeleteUser = async (uid: string, email: string) => {
        if (isProtected(email)) {
            showAlert("This is a protected admin account and cannot be deleted.", { type: "error" });
            return;
        }
        showConfirm("Are you sure you want to delete this user? This cannot be undone.", async () => {
            try {
                const { deleteUser } = await import("@/app/actions/admin");
                const result = await deleteUser(uid);

                if (result.success) {
                    setUsers(users.filter(u => u.uid !== uid));
                    showAlert("User deleted successfully.", { type: "success" });
                } else {
                    showAlert("Failed to delete: " + result.error, { type: "error" });
                }
            } catch (error) {
                console.error("Delete failed", error);
                showAlert("Delete failed", { type: "error" });
            }
        }, { type: "error", title: "Confirm Delete" });
    };

    const handleApprovePayment = async (paymentId: string) => {
        showConfirm("Approve this payment and activate subscription?", async () => {
            const result = await approvePayment(paymentId);
            if (result.success) {
                showAlert("Payment approved!", { type: "success" });
                fetchData();
            } else {
                showAlert("Error: " + result.error, { type: "error" });
            }
        });
    };

    const handleRejectPayment = async (paymentId: string) => {
        showPrompt("Reason for rejection:", async (reason) => {
            const result = await rejectPayment(paymentId, reason);
            if (result.success) {
                showAlert("Payment rejected.", { type: "success" });
                fetchData();
            } else {
                showAlert("Error: " + result.error, { type: "error" });
            }
        }, { title: "Reject Payment", placeholder: "e.g. Invalid UTR" });
    };

    const handleSaveSettings = async () => {
        try {
            await setDoc(doc(getDb(), "settings", "global"), settings, { merge: true });
            showAlert("Settings saved!", { type: "success" });
        } catch (error) {
            console.error(error);
            showAlert("Failed to save settings", { type: "error" });
        }
    };

    const handleImpersonate = async (uid: string) => {
        showConfirm("Are you sure you want to log in as this user? You will be signed out from your admin account.", async () => {
            try {
                const requesterUid = getClientAuth().currentUser?.uid;
                if (!requesterUid) throw new Error("No authenticated requester found");

                const result = await impersonateUser(uid, requesterUid);
                if (result.success && result.token) {
                    await signInWithCustomToken(getClientAuth(), result.token);
                    // Redirect to dashboard as the new user
                    router.push("/dashboard");
                    router.refresh(); // Ensure layout/state updates
                } else {
                    showAlert("Impersonation failed: " + result.error, { type: "error" });
                }
            } catch (error) {
                console.error("Auth switch failed", error);
                showAlert("Failed to switch user account.", { type: "error" });
            }
        });
    };

    if (isAdmin === null) return <div className="p-10 text-center">Checking Permissions...</div>;
    if (isAdmin === false) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="bg-red-600 text-xs px-2 py-1 rounded text-white uppercase tracking-wider">
                                {isSuperAdmin ? "Super Admin" : "Admin"}
                            </span>
                            Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1">Manage users, subscriptions, and approvals.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={fetchData}
                            variant="outline"
                            className="flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </Button>
                    </div>
                </header>

                <div className="mb-6 flex gap-4 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payments' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        All Users
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Settings
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading data...</div>
                ) : (
                    <>
                        {activeTab === 'payments' && (
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                {payments.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No pending payments.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR / Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proof</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {payments.map((payment) => (
                                                    <tr key={payment.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.id.substring(0, 8)}...
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                            {payment.userId}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">₹{payment.amount}</div>
                                                            <div className="text-xs text-gray-500">UTR: {payment.utrNumber}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                                                                <Eye className="w-3 h-3" /> View Proof
                                                            </a>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <Button
                                                                onClick={() => handleApprovePayment(payment.id)}
                                                                className="text-green-600 mr-2" variant="ghost" size="sm"
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleRejectPayment(payment.id)}
                                                                className="text-red-600" variant="ghost" size="sm"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Controls</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                                        <div className="text-xs text-gray-500">UID: {user.uid}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-indigo-100 text-indigo-800' : user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {user.subscriptionStatus}
                                                        </span>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-GB') : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handlePromoteAdmin(user.uid, user.role, user.email)}
                                                            className={user.role === 'admin' ? 'text-orange-600' : 'text-purple-600'}
                                                            disabled={!isSuperAdmin || user.role === 'super_admin'}
                                                            title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                        >
                                                            {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                        </Button>
                                                        {isSuperAdmin && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleImpersonate(user.uid)}
                                                                className="text-blue-600"
                                                                title="Login as User"
                                                            >
                                                                <UserCircle className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {user.subscriptionStatus !== 'active' ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(user.uid, 'active')}
                                                                className="text-green-600"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(user.uid, 'expired')}
                                                                className="text-red-600"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.uid, user.email)}
                                                            className="text-gray-400 hover:text-red-600"
                                                            disabled={!isSuperAdmin || user.role === 'super_admin'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-4">
                                    {users.map((user) => (
                                        <div key={user.uid} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-bold text-gray-900 truncate">{user.email}</div>
                                                    <div className="text-[10px] text-gray-500 truncate">UID: {user.uid}</div>
                                                </div>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${user.role === 'super_admin' ? 'bg-indigo-100 text-indigo-800' : user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {user.role}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full font-medium ${user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.subscriptionStatus}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString('en-GB') : 'No expiry'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handlePromoteAdmin(user.uid, user.role, user.email)}
                                                        className={user.role === 'admin' ? 'text-orange-600' : 'text-purple-600'}
                                                        disabled={!isSuperAdmin || user.role === 'super_admin'}
                                                    >
                                                        {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                    </Button>
                                                    {isSuperAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleImpersonate(user.uid)}
                                                            className="text-blue-600"
                                                        >
                                                            <UserCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {user.subscriptionStatus !== 'active' ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(user.uid, 'active')}
                                                            className="text-green-600"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleUpdateStatus(user.uid, 'expired')}
                                                            className="text-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.uid, user.email)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    disabled={!isSuperAdmin || user.role === 'super_admin'}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-xl font-bold mb-6">Payment Configuration</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                        <input
                                            type="text"
                                            value={settings.upiId}
                                            onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. merchant@upi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Support WhatsApp Number</label>
                                        <input
                                            type="text"
                                            value={settings.supportNumber}
                                            onChange={(e) => setSettings({ ...settings, supportNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. 917004516415"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Include country code without '+'.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Welcome Message</label>
                                        <textarea
                                            value={settings.supportMessage}
                                            onChange={(e) => setSettings({ ...settings, supportMessage: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. Hi LinkGen Support, I need help with my account."
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
                                        <div className="flex gap-4 items-start">
                                            {settings.qrCodeUrl && (
                                                <div className="relative w-48 h-48 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 mb-3 md:mb-0">
                                                    <img src={settings.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        try {
                                                            const { uploadToCloudinary } = await import("@/lib/cloudinary");
                                                            showAlert("Uploading QR Code...", { type: "info" });
                                                            const url = await uploadToCloudinary(file);
                                                            setSettings({ ...settings, qrCodeUrl: url });
                                                            showAlert("Upload complete!", { type: "success" });
                                                        } catch (err) {
                                                            showAlert("Failed to upload image", { type: "error" });
                                                            console.error(err);
                                                        }
                                                    }}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Upload a new QR Code image.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <Button onClick={handleSaveSettings} className="w-full">
                                            Save Settings
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
