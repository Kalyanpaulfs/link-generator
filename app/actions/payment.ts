"use server";

import { db } from "@/lib/firebase"; // Ensure firebase-admin is initialized if running on server? 
// Wait, lib/firebase.ts uses client SDK.
// For server actions, we should strictly use `firebase-admin` to bypass client rules if needed, 
// OR use the client SDK if we authenticate via token?
// Next.js Server Actions run on the server. We should use `firebase-admin`.
// I need `lib/firebase-admin.ts`. I saw it in the file list.

import { adminDb } from "@/lib/firebase-admin";
import { Payment } from "@/types";
import { Timestamp, Transaction } from "firebase-admin/firestore";

export async function submitPayment(userId: string, planId: string, utrNumber: string, screenshotUrl: string, amount: number) {
    if (!userId || !planId || !screenshotUrl) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        // Create Subscription Record (Pending)
        const subRef = adminDb.collection('subscriptions').doc();
        const paymentRef = adminDb.collection('payments').doc();

        await adminDb.runTransaction(async (t: Transaction) => {
            // Create pending subscription
            t.set(subRef, {
                id: subRef.id,
                userId,
                planId,
                status: 'pending',
                startDate: Timestamp.now().toMillis(), // Placeholder, will set on approval
                endDate: Timestamp.now().toMillis(),
                paymentId: paymentRef.id,
                createdAt: Timestamp.now().toMillis(),
            });

            // Create payment record
            t.set(paymentRef, {
                id: paymentRef.id,
                userId,
                subscriptionId: subRef.id,
                amount,
                utrNumber: utrNumber || '',
                screenshotUrl,
                status: 'pending',
                createdAt: Timestamp.now().toMillis(),
            });

            // Update user status to pending so UI reflects it immediately
            const userRef = adminDb.collection('users').doc(userId);
            console.log("Updating user status to pending for:", userId);
            t.update(userRef, {
                subscriptionStatus: 'pending'
            });
            console.log("User status update queued in transaction");
        });

        console.log("Transaction committed successfully");
        return { success: true, subscriptionId: subRef.id };
    } catch (error) {
        console.error("Payment submission error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to submit payment" };
    }
}
