"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function activateTrial(userId: string) {
    try {
        await adminDb.runTransaction(async (t) => {
            const userRef = adminDb.collection('users').doc(userId);
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) throw new Error("User not found");
            const userData = userDoc.data();

            if (userData?.subscriptionStatus !== 'none') {
                // Already has status (maybe expired or trial used?)
                // If we want to allow re-trial, strict check mostly needed.
                // For now, assuming they can only do this if status is 'none'
                // throw new Error("Trial already used or active subscription exists");
            }

            // Allow trial activation
            t.update(userRef, {
                subscriptionStatus: 'trial',
                subscriptionExpiry: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error("Trial activation failed:", error);
        return { success: false, error: error.message };
    }
}
