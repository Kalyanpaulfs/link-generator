"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPlan } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ImageUpload";
import { Input } from "@/components/ui/Input";
import { submitPayment } from "@/app/actions/payment";
import { getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { useSettings } from "@/hooks/useSettings";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function PaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planId = searchParams.get('planId');
    const plan = planId ? getPlan(planId) : null;

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [utr, setUtr] = useState("");
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { settings, loading: settingsLoading } = useSettings();

    useEffect(() => {
        const auth = getAuth(app);

        const checkSubscription = async (user: any) => {
            if (!user) return;

            // Check for existing active/pending subscription
            const q = query(
                collection(db, "subscriptions"),
                where("userId", "==", user.uid),
                where("status", "in", ["active", "pending"])
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                // Redirect to dashboard
                // We could show a toast here, but router.push is immediate
                // DANGER LOOPS: If "Subscribe Now" button sends them here with planId, 
                // but they have a pending sub, we bounce them to dashboard.
                // Dashboard sees pending sub -> shows banner.
                // This is CORRECT behavior.

                // EXCEPT: The user says "Clicked Subscribe Now -> Instant Return".
                // This means the guard is working (they have a sub), but they are confused.
                // They expect to be able to pay again? Or they don't know they have a sub?

                console.log("Active/Pending subscription found, redirecting to dashboard");
                router.push('/dashboard');
                // Make sure to stop rendering or show loading
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
                checkSubscription(user);
            } else {
                // Handle unauth if needed, or let middleware handle it
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-xl text-red-500">Invalid Plan Selected</p>
                <Button onClick={() => router.push('/plans')} className="mt-4">Back to Plans</Button>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!utr || !screenshotUrl || !currentUser) return;

        setSubmitting(true);
        try {
            const result = await submitPayment(
                currentUser.uid,
                plan.id,
                utr,
                screenshotUrl,
                plan.price
            );

            if (result.success) {
                // Redirect to dashboard with success param
                router.push('/dashboard?payment_success=true');
            } else {
                alert("Payment submission failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Make Payment</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center py-4 border-b border-gray-100">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-medium text-gray-900">{plan.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-gray-100">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium text-gray-900">{plan.durationInDays} Days</span>
                            </div>
                            <div className="flex justify-between items-center py-4 text-lg font-bold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-green-600">₹{plan.price}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                        <h4 className="text-blue-900 font-semibold mb-2">Instructions</h4>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
                            <li>Scan the QR Code to pay via UPI.</li>
                            <li>Enter the exact amount: <strong>₹{plan.price}</strong></li>
                            <li>Take a screenshot of the success screen.</li>
                            <li>Upload the screenshot and enter the UTR/Ref No.</li>
                            <li>Click Submit.</li>
                        </ol>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 1: Scan & Pay</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            {settingsLoading ? (
                                <div className="h-48 flex items-center justify-center">Loading Payment Details...</div>
                            ) : (
                                <>
                                    <div className="bg-white border rounded-lg p-2 mb-4 shadow-sm">
                                        {settings.qrCodeUrl ? (
                                            <img src={settings.qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                                        ) : (
                                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center">
                                                QR Code Not Configured
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-mono text-lg font-bold bg-gray-50 px-4 py-2 rounded border border-gray-200 text-gray-800 tracking-wider">
                                        {settings.upiId || "UPI ID Not Configured"}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Submit Proof</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    UTR / Reference Number
                                </label>
                                <Input
                                    placeholder="e.g. 123456789012"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                />
                            </div>

                            <ImageUpload
                                onUploadComplete={(url) => setScreenshotUrl(url)}
                            />

                            <Button
                                className="w-full mt-4"
                                onClick={handleSubmit}
                                disabled={submitting || !utr || !screenshotUrl}
                                isLoading={submitting}
                            >
                                Submit for Approval
                            </Button>
                            {/* DEBUG: {JSON.stringify({ utr: !!utr, screenshot: !!screenshotUrl, submitting })} */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
