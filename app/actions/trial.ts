"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function activateTrial(userId: string) {
    try {
        await getAdminDb().runTransaction(async (t) => {
            const userRef = getAdminDb().collection('users').doc(userId);
            const userDoc = await t.get(userRef);

            if (!userDoc.exists) throw new Error("User not found");
            const userData = userDoc.data();

            if (userData?.subscriptionStatus && userData.subscriptionStatus !== 'none') {
                throw new Error("Free trial already used or an active subscription exists.");
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
