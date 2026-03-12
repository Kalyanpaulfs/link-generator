"use client";

import React, { useState } from "react";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Check, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { useAlerts } from "@/context/AlertContext";

export default function PlansPage() {
    const router = useRouter();
    const { userData, isAdmin, isSubscribed, loading } = useRole();
    const { showAlert, showConfirm } = useAlerts();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    // Filter plans based on view (simplification for UI)
    const displayPlans = PLANS.filter(p => {
        if (p.id === 'free-trial') {
            // Hide trial if used OR currently active/trial
            if (userData?.trialUsed || isSubscribed || userData?.subscriptionStatus === 'pending') return false;
            return true;
        }
        if (billingCycle === 'monthly') return p.id.includes('monthly');
        if (billingCycle === 'annual') return p.id.includes('annual');
        return false;
    });

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'free-trial') {
            showConfirm("Start your 14-day free trial?", async () => {
                try {
                    const { activateTrial } = await import('@/app/actions/trial');
                    const { getClientAuth } = await import('@/lib/firebase');
                    const user = getClientAuth().currentUser;

                    if (!user) {
                        showAlert("Please log in to select a plan.", { type: "error" });
                        return;
                    }

                    const result = await activateTrial(user.uid);
                    if (result.success) {
                        showAlert("Trial Activated! Redirecting to Dashboard...", { type: "success" });
                        setTimeout(() => window.location.href = '/dashboard', 1500);
                    } else {
                        showAlert("Failed to activate trial: " + result.error, { type: "error" });
                    }
                } catch (error) {
                    console.error(error);
                    showAlert("Error activating trial", { type: "error" });
                }
            }, { title: "Confirm Trial Activation" });
        } else {
            router.push(`/payment?planId=${planId}`);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading plans...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    Choose Your Plan
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Unlock the full potential of WhatsApp links with our premium plans.
                </p>

                <div className="mt-8 inline-flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('annual')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'annual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Annual <span className="text-green-600 text-xs ml-1 font-bold">SAVE 20%</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayPlans.map((plan) => (
                    <Card key={plan.id} className={`relative flex flex-col ${plan.id.includes('pro') ? 'border-gray-900 shadow-md ring-1 ring-gray-900/5' : ''}`}>
                        {plan.id.includes('pro') && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    Popular
                                </span>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>{plan.name}</span>
                            </CardTitle>
                            <div className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-4xl font-extrabold tracking-tight">
                                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                                </span>
                                {plan.price > 0 && (
                                    <span className="ml-1 text-xl font-medium text-gray-500">
                                        /{plan.durationInDays >= 365 ? 'yr' : 'mo'}
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                                    <span className="text-gray-700 font-medium">
                                        {plan.linkLimit} WhatsApp Link{plan.linkLimit > 1 ? 's' : ''}
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                                    <span className="text-gray-700">Analytics Dashboard</span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
                                    <span className="text-gray-700">24/7 Support</span>
                                </li>
                                {plan.id === 'free-trial' && (
                                    <li className="flex items-start">
                                        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mr-3" />
                                        <span className="text-gray-600 text-sm italic">Limited to 14 days</span>
                                    </li>
                                )}
                            </ul>

                            <Button
                                onClick={() => handleSelectPlan(plan.id)}
                                variant={plan.id.includes('pro') ? 'primary' : 'outline'}
                                className="w-full"
                            >
                                {plan.price === 0 ? 'Start Free Trial' : 'Subscribe Now'}
                            </Button>
                            {plan.id === 'free-trial' && userData?.trialUsed && (
                                <p className="text-center text-xs text-red-500 mt-2 font-medium">Free trial used</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-16 text-center">
                <p className="text-gray-500 text-sm">
                    Payments are handled manually. Activation typically takes less than 30 minutes during business hours.
                </p>
            </div>
        </div>
    );
}
