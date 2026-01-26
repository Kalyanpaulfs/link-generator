"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav with Glassmorphism */}
            <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                                LinkGen
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && (
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    {user.email}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                {children}
            </main>
        </div>
    );
}
