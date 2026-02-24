"use server";

import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { Timestamp, Transaction } from "firebase-admin/firestore";
import { getPlan } from "@/lib/plans";
import { Role } from "@/types";
import { isProtected } from "@/lib/constants";

export async function approvePayment(paymentId: string) {
    try {
        await getAdminDb().runTransaction(async (t: Transaction) => {
            const paymentRef = getAdminDb().collection('payments').doc(paymentId);
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
            const subRef = getAdminDb().collection('subscriptions').doc(subscriptionId);
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
            const userRef = getAdminDb().collection('users').doc(userId);
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
        await getAdminDb().runTransaction(async (t: Transaction) => {
            const paymentRef = getAdminDb().collection('payments').doc(paymentId);
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
            const subRef = getAdminDb().collection('subscriptions').doc(subscriptionId);
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

export async function updateUserRole(userId: string, newRole: Role) {
    try {
        const userRef = getAdminDb().collection('users').doc(userId);
        const userSnap = await userRef.get();
        if (!userSnap.exists) throw new Error("User not found");

        const userData = userSnap.data() as any;

        // Protect Super Admin from demotion
        if (userData.role === 'super_admin' && newRole !== 'super_admin') {
            throw new Error("Cannot demote a Super Admin account");
        }

        // Hardcoded protection fallback for the owner's email
        if (isProtected(userData.email) && newRole !== 'super_admin' && newRole !== 'admin') {
            throw new Error("Cannot demote the primary owner account");
        }

        await userRef.update({ role: newRole });
        return { success: true };
    } catch (error: any) {
        console.error("Role update failed:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        const userRef = getAdminDb().collection('users').doc(userId);
        const userSnap = await userRef.get();
        if (!userSnap.exists) throw new Error("User not found");

        const userData = userSnap.data() as any;

        // Protect Super Admin from deletion
        if (userData.role === 'super_admin') {
            throw new Error("Cannot delete a Super Admin account");
        }

        // Hardcoded protection fallback for the owner's email
        if (isProtected(userData.email)) {
            throw new Error("Cannot delete the primary owner account");
        }

        // Delete from Firebase Auth
        await getAdminAuth().deleteUser(userId);

        // Delete from Firestore
        await userRef.delete();

        return { success: true };
    } catch (error: any) {
        console.error("Delete failed:", error);
        return { success: false, error: error.message };
    }
}
