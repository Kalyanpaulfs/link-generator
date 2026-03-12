"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserData } from "@/types";
import { Calendar, Crown, Info, Timer, X } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";

interface SubscriptionStatusProps {
    userData: UserData | null;
}

export function SubscriptionStatus({ userData }: SubscriptionStatusProps) {
    const { settings } = useSettings();
    if (!userData) return null;

    const supportLink = `https://wa.me/${settings.supportNumber || '917004516415'}?text=${encodeURIComponent(settings.supportMessage || "Hi Support, I need help with my account.")}`;

    const { subscriptionStatus, subscriptionExpiry, role } = userData;
    const isAdmin = role === 'admin' || role === 'super_admin';

    if (isAdmin) return null;

    const now = Date.now();
    const isExpired = !!(subscriptionExpiry && subscriptionExpiry < now);
    const daysRemaining = subscriptionExpiry
        ? Math.ceil((subscriptionExpiry - now) / (1000 * 60 * 60 * 24))
        : 0;

    console.log(`SubscriptionStatus: expiry=${subscriptionExpiry}, now=${now}, isExpired=${isExpired}, daysRemaining=${daysRemaining}`);

    const getStatusConfig = () => {
        switch (subscriptionStatus) {
            case 'active':
                return {
                    label: 'Premium Active',
                    icon: <Crown className="w-5 h-5 text-indigo-600" />,
                    bgColor: 'bg-indigo-50',
                    borderColor: 'border-indigo-100',
                    textColor: 'text-indigo-900',
                    description: isExpired ? 'Your plan has expired.' : `You have ${daysRemaining} days left.`,
                };
            case 'trial':
                return {
                    label: 'Free Trial',
                    icon: <Timer className="w-5 h-5 text-blue-600" />,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-100',
                    textColor: 'text-blue-900',
                    description: isExpired ? 'Trial expired.' : `Trial ends in ${daysRemaining} days.`,
                };
            case 'pending':
                return {
                    label: 'Payment Pending',
                    icon: <Info className="w-5 h-5 text-yellow-600" />,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-100',
                    textColor: 'text-yellow-900',
                    description: (
                        <span>
                            Admin is reviewing your payment. <a href={supportLink} target="_blank" className="font-bold underline text-yellow-700">Need help?</a>
                        </span>
                    ),
                };
            case 'rejected':
                return {
                    label: 'Payment Rejected',
                    icon: <X className="w-5 h-5 text-red-600" />,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-100',
                    textColor: 'text-red-900',
                    description: (
                        <div className="space-y-1">
                            <p className="font-bold">Reason: {userData.lastRejectionReason || 'Invalid proof'}</p>
                            <p>Please try again with correct details.</p>
                        </div>
                    ),
                };
            case 'expired':
            case 'none':
            default:
                return {
                    label: 'No Active Plan',
                    icon: <Info className="w-5 h-5 text-red-600" />,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-100',
                    textColor: 'text-red-900',
                    description: (
                        <span>
                            Upgrade to create and keep links active. <a href={supportLink} target="_blank" className="font-bold underline text-red-700">Support</a>
                        </span>
                    ),
                };
        }
    };

    const config = getStatusConfig();
    const showUpgrade = subscriptionStatus !== 'active' || isExpired || daysRemaining <= 7;

    return (
        <Card className={`border-l-4 ${config.borderColor} overflow-visible relative`}>
            <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${config.bgColor} shadow-sm`}>
                            {config.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold uppercase tracking-wider ${config.textColor}`}>
                                    {config.label}
                                </span>
                                {isExpired && (
                                    <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                        Expired
                                    </span>
                                )}
                            </div>
                            <div className="text-gray-600 text-sm font-medium mt-0.5">
                                {config.description}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {subscriptionExpiry > 0 && (
                            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 font-medium px-3 py-1 bg-gray-50 rounded-lg">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Expires: {new Date(subscriptionExpiry).toLocaleDateString('en-GB')}</span>
                            </div>
                        )}
                        {showUpgrade && (
                            <Link href="/plans">
                                <Button size="sm" className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6">
                                    {subscriptionStatus === 'none' || subscriptionStatus === 'expired' ? 'View Plans' : 'Renew / Upgrade'}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Subtle background flair */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10 pointer-events-none">
                <Crown className="w-16 h-16 text-gray-900 rotate-12" />
            </div>
        </Card>
    );
}
