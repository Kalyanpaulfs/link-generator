"use client";

import { useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { sendOtp, verifyOtp } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await sendOtp(email, 'signup');
            if (res.success) {
                setStep('otp');
            } else {
                setError(res.error || "Failed to send code.");
            }
        } catch (err: any) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await verifyOtp(email, otp, 'signup');
            if (res.success && res.token) {
                await signInWithCustomToken(auth, res.token);
                router.push("/dashboard");
            } else {
                setError(res.error || "Invalid code.");
            }
        } catch (err: any) {
            console.error(err);
            setError("Verification failed. Please try again.");
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
                    {step === 'email' ? "Create your account" : "Check your email"}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {step === 'email'
                        ? "Enter your email to get started with a free trial."
                        : `We've sent a 6-digit code to ${email}`}
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
                        {step === 'email' ? (
                            <form className="space-y-6" onSubmit={handleSendOtp}>
                                <Input
                                    label="Email address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />

                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 border border-red-100">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <Button type="submit" className="w-full h-11 text-base shadow-sm font-semibold" isLoading={loading}>
                                        Send Code
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form className="space-y-6" onSubmit={handleVerifyOtp}>
                                <Input
                                    label="Verification Code"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="text-center text-2xl tracking-widest"
                                />

                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 border border-red-100">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <Button type="submit" className="w-full h-11 text-base shadow-sm font-semibold" isLoading={loading}>
                                        Verify & Create Account
                                    </Button>
                                    <div className="mt-4 text-center">
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={handleSendOtp}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="text-sm text-gray-500 hover:text-gray-900"
                                    >
                                        Change email
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
