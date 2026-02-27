"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, ArrowRight, Crown, LogIn, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionExpiredPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 mb-6 border border-indigo-50">
                        <Crown className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Link Unavailable
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium">
                        This WhatsApp redirect link is currently inactive.
                    </p>
                </div>

                <Card className="border-none shadow-2xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="p-4 bg-red-50 rounded-full">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">Subscription Required</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    The owner's subscription for this service has expired or reached its limit. Links are temporarily disabled until the plan is renewed.
                                </p>
                            </div>

                            <div className="w-full pt-4 space-y-3">
                                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3 text-left">
                                    <MessageCircle className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-indigo-900">Are you the link owner?</p>
                                        <p className="text-xs text-indigo-700 mt-0.5">Renew your subscription to reactivate all your links instantly.</p>
                                    </div>
                                </div>

                                <Link href="/login" className="block w-full">
                                    <Button className="w-full bg-gray-900 hover:bg-black text-white h-12 text-base font-bold shadow-lg shadow-gray-200">
                                        Login to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>

                                <Link href="/plans" className="block w-full">
                                    <Button variant="outline" className="w-full h-12 text-base font-bold border-gray-200">
                                        View Pricing Plans
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-xs text-gray-400 font-medium tracking-wide flex items-center justify-center gap-1">
                    Powered by <span className="text-indigo-600 font-bold">LinkGen</span>
                </p>
            </div>
        </div>
    );
}
