
"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole"; // Import new hook
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth(); // We might not need this if useRole gives us userData
    const { isAdmin, isSubscribed, loading: roleLoading, subscriptionStatus } = useRole();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!roleLoading) {
            const isPlansPage = pathname.startsWith('/plans') || pathname.startsWith('/payment');
            // If user is NOT subscribed and NOT on plans/payment page, redirect to plans
            // ALLOW if status is 'pending' so they can see the "Under Review" screen
            if (!isSubscribed && subscriptionStatus !== 'pending' && !isPlansPage) {
                router.push('/plans');
            }
        }
    }, [isSubscribed, roleLoading, pathname, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const isActive = (path: string) => pathname === path;

    // Prevent flash of dashboard content
    const isPlansPage = pathname.startsWith('/plans') || pathname.startsWith('/payment');
    const shouldBlock = !roleLoading && !isSubscribed && subscriptionStatus !== 'pending' && !isPlansPage;

    // While loading role or if blocking access, show nothing or loader?
    if (roleLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;

    // Check pending first
    if (subscriptionStatus === 'pending' && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
                    <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Verification in Progress</h2>
                    <p className="text-gray-500 mb-6">
                        We have received your payment details. Admin approval typically takes 30 minutes. You will access the dashboard once approved.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline">Check Status</Button>
                    <div className="mt-4">
                        <Button variant="ghost" className="text-sm text-gray-400" onClick={handleLogout}>Sign Out</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (shouldBlock) return null; // Router push in effect will handle it

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* ... Navbar ... */}
            <nav className="sticky top-0 z-30 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
                                <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                                <span className="font-bold text-gray-900 tracking-tight text-lg">LinkGen</span>
                            </div>
                            <div className="hidden sm:flex sm:space-x-4">
                                <Link
                                    href="/dashboard"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Dashboard
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/admin') ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >
                                        Admin
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="hidden md:flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-xs border border-indigo-200">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-700 hidden md:block font-medium">
                                        {user.email}
                                    </span>
                                </div>
                            )}
                            <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                            <div className="hidden sm:block">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-gray-500 hover:text-red-600"
                                >
                                    Sign out
                                </Button>
                            </div>
                            {/* Mobile menu button */}
                            <div className="flex items-center sm:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <X className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Menu className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden border-t border-gray-200 bg-white">
                        <div className="pt-2 pb-3 space-y-1">
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/dashboard') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'}`}
                            >
                                Dashboard
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/admin') ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'}`}
                                >
                                    Admin
                                </Link>
                            )}
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            {/* ... mobile profile ... */}
                            <div className="px-2">
                                <Button
                                    variant="ghost"
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                >
                                    Sign out
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
