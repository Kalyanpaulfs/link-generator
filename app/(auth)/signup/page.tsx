"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // TEMPORARY CLEANUP REMOVED

    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document with 'none' status to force plan selection
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: "user",
                subscriptionStatus: "none",
                subscriptionExpiry: 0,
                createdAt: Date.now(),
            });

            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

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
                    Start your 14-day free trial
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    No credit card required. Cancel anytime.
                </p>
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link href="/login" className="text-gray-900 font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
                        <form className="space-y-6" onSubmit={handleSignup}>
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
                                    Create Account
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
