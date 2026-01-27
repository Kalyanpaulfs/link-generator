"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { Timestamp, Transaction } from "firebase-admin/firestore";
import { getPlan } from "@/lib/plans";

export async function approvePayment(paymentId: string) {
    try {
        await adminDb.runTransaction(async (t: Transaction) => {
            const paymentRef = adminDb.collection('payments').doc(paymentId);
            const paymentDoc = await t.get(paymentRef);

            if (!paymentDoc.exists) {
                throw new Error("Payment not found");
            }

            const paymentData = paymentDoc.data();
            if (!paymentData || paymentData.status !== 'pending') {
                throw new Error("Payment is not pending or invalid");
            }

            const { userId, subscriptionId } = paymentData as any;

            // Allow fetch subscription to get planId
            const subRef = adminDb.collection('subscriptions').doc(subscriptionId);
            const subDoc = await t.get(subRef);
            if (!subDoc.exists) throw new Error("Subscription not found");
            const subData = subDoc.data();
            const plan = getPlan(subData?.planId);

            if (!plan) throw new Error("Invalid plan in subscription");

            // Calculate dates
            const startDate = Timestamp.now();
            const endDateMs = startDate.toMillis() + (plan.durationInDays * 24 * 60 * 60 * 1000);
            // const endDate = Timestamp.fromMillis(endDateMs);

            // Update Payment
            t.update(paymentRef, {
                status: 'approved',
                processedAt: Timestamp.now()
            });

            // Update Subscription
            t.update(subRef, {
                status: 'active',
                startDate: startDate.toMillis(),
                endDate: endDateMs,
                updatedAt: Timestamp.now().toMillis()
            });

            // Update User
            const userRef = adminDb.collection('users').doc(userId);
            t.update(userRef, {
                subscriptionStatus: 'active',
                subscriptionExpiry: endDateMs,
                planId: plan.id
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error("Approval failed:", error);
        return { success: false, error: error.message };
    }
}

export async function rejectPayment(paymentId: string, reason: string) {
    try {
        await adminDb.runTransaction(async (t: Transaction) => {
            const paymentRef = adminDb.collection('payments').doc(paymentId);
            const paymentDoc = await t.get(paymentRef);
            if (!paymentDoc.exists) {
                throw new Error("Payment not found");
            }
            const { subscriptionId } = paymentDoc.data() as any;

            // Update Payment
            t.update(paymentRef, {
                status: 'rejected',
                rejectionReason: reason,
                processedAt: Timestamp.now()
            });

            // Update Subscription
            const subRef = adminDb.collection('subscriptions').doc(subscriptionId);
            t.update(subRef, {
                status: 'rejected',
                updatedAt: Timestamp.now().toMillis()
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error("Rejection failed:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        // Delete from Firebase Auth
        await adminAuth.deleteUser(userId);

        // Delete from Firestore
        await adminDb.collection('users').doc(userId).delete();

        // Optional: Delete related subscriptions/payments? 
        // For now, keeping them for audit might be safer or we can cascade delete.
        // Let's stick to user cleanup.

        return { success: true };
    } catch (error: any) {
        console.error("Delete failed:", error);
        return { success: false, error: error.message };
    }
}
