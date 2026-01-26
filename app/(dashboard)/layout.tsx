"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole"; // Import new hook
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const { isAdmin } = useRole(); // Check admin status
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Premium Top Navbar */}
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
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-xs border border-indigo-200">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm text-gray-700 hidden md:block font-medium">
                                        {user.email}
                                    </span>
                                </div>
                            )}
                            <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-600"
                            >
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
