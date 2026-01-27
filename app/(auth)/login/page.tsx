"use client";

import { useState, Suspense } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/dashboard";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user exists in Firestore (synced with Admin deletions)
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                // User deleted by admin but still in Auth
                const { signOut } = await import("firebase/auth");
                await signOut(auth);
                throw new Error("User account not found. Please sign up again.");
            }

            router.push(redirect);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleLogin}>
            <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
            />

            <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
            />

            {error && (
                <div className="rounded-md bg-red-50 p-3 border border-red-100">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <Button type="submit" className="w-full h-11 text-base shadow-sm font-semibold" isLoading={loading}>
                    Sign in
                </Button>
            </div>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
            {/* Back Button */}
            <div className="absolute top-8 left-8">
                <Link href="/">
                    <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Button>
                </Link>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-10 w-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                </div>
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up for free
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
                    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
