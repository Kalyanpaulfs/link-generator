"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { nanoid } from "nanoid";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user document with trial status
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                role: "user",
                subscriptionStatus: "trial",
                subscriptionExpiry: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-10 w-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                </div>
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="shadow-lg border-gray-100">
                    <CardContent className="pt-8 pb-8 px-8">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
