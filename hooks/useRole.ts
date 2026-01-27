"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { UserData } from "@/types";

export function useRole() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setUserData(null);
                setLoading(false);
                return;
            }

            // Real-time listener for user document
            const userRef = doc(db, "users", user.uid);
            const userUnsub = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserData(docSnap.data() as UserData);
                } else {
                    // Fallback for new users waiting for creation or errors
                    setUserData({ uid: user.uid, email: user.email!, role: 'user', subscriptionStatus: 'none', subscriptionExpiry: 0 });
                }
                setLoading(false);
            }, (error) => {
                console.error("Role listener failed", error);
                setLoading(false);
            });

            return () => userUnsub();
        });

        return () => unsubscribe();
    }, []);

    return {
        role: userData?.role,
        userData,
        loading,
        isAdmin: userData?.role === 'admin',
        isSubscribed: userData?.role === 'admin' || userData?.subscriptionStatus === 'active' || userData?.subscriptionStatus === 'trial',
        subscriptionStatus: userData?.subscriptionStatus
    };
}
