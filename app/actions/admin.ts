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

            const userRef = getAdminDb().collection('users').doc(userId);
            const userDoc = await t.get(userRef);

            // Calculate dates
            const userData = userDoc.data();
            const currentExpiry = userData?.subscriptionExpiry || 0;
            const now = Date.now();
            
            // If user has a valid unexpired plan, add to it. Otherwise start from now.
            const baseDate = currentExpiry > now ? currentExpiry : now;
            const durationMs = plan.durationInDays * 24 * 60 * 60 * 1000;
            const endDateMs = baseDate + durationMs;
            const startDate = Timestamp.fromMillis(now);

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
            const { userId, subscriptionId } = paymentDoc.data() as any;

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

            // Update User to unblock them and show reason
            const userRef = getAdminDb().collection('users').doc(userId);
            t.update(userRef, {
                subscriptionStatus: 'rejected',
                lastRejectionReason: reason
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
        // Batch delete associated links
        const linksRef = getAdminDb().collection('links').where('userId', '==', userId);
        const linksSnap = await linksRef.get();
        if (!linksSnap.empty) {
            const batch = getAdminDb().batch();
            linksSnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Deleted ${linksSnap.size} links for user ${userId}`);
        }

        await userRef.delete();
        return { success: true };
    } catch (error: any) {
        console.error("Delete failed:", error);
        return { success: false, error: error.message };
    }
}

export async function impersonateUser(targetUid: string, requesterUid: string) {
    try {
        // 1. Verify requester is a super_admin
        const requesterRef = getAdminDb().collection('users').doc(requesterUid);
        const requesterSnap = await requesterRef.get();
        if (!requesterSnap.exists) throw new Error("Requester not found");

        const requesterData = requesterSnap.data();
        if (requesterData?.role !== 'super_admin') {
            throw new Error("Unauthorized: Only Super Admins can impersonate users.");
        }

        // 2. Verification: Check if target user exists
        const userRef = getAdminDb().collection('users').doc(targetUid);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            throw new Error("Target user not found in database.");
        }

        // 3. Generate Custom Token
        const token = await getAdminAuth().createCustomToken(targetUid);
        return { success: true, token };
    } catch (error: any) {
        console.error("Impersonation failed:", error);
        return { success: false, error: error.message };
    }
}
