"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { PLANS } from "@/lib/plans";
import { nanoid } from "nanoid";

export async function createLink(userId: string, whatsappNumber: string, customMessage?: string) {
    try {
        const result = await getAdminDb().runTransaction(async (t) => {
            const userRef = getAdminDb().collection('users').doc(userId);
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) throw new Error("User not found");
            const userData = userDoc.data();

            // 1. Check subscription status
            const status = userData?.subscriptionStatus;
            const expiry = userData?.subscriptionExpiry;
            const now = Date.now();

            const isSubscribed = (
                userData?.role === 'admin' || 
                userData?.role === 'super_admin' ||
                ((status === 'active' || status === 'trial') && expiry && expiry > now)
            );

            if (!isSubscribed) {
                throw new Error("No active subscription. Please upgrade to create links.");
            }

            // 2. Check Plan Limit
            if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
                const planId = userData?.planId || (status === 'trial' ? 'free-trial' : 'none');
                const plan = PLANS.find(p => p.id === planId);
                
                if (!plan) throw new Error("Subscription plan not found.");

                // Count existing links
                const linksSnap = await t.get(
                    getAdminDb().collection('links').where('userId', '==', userId)
                );
                
                if (linksSnap.size >= plan.linkLimit) {
                    throw new Error(`Your current plan ("${plan.name}") is limited to ${plan.linkLimit} link(s). Please upgrade to create more.`);
                }
            }

            // 3. Create the link
            const slug = nanoid(7);
            const linkRef = getAdminDb().collection('links').doc();
            
            const newLink = {
                slug,
                userId,
                whatsappNumber,
                customMessage: customMessage || "",
                active: true,
                clicks: 0,
                createdAt: Date.now()
            };

            t.set(linkRef, newLink);
            return { success: true, slug };
        });

        return result;
    } catch (error: any) {
        console.error("Create link failed:", error);
        return { success: false, error: error.message };
    }
}
