"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { UserData } from "@/types";

export function useRole() {
    const [role, setRole] = useState<"admin" | "user" | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setRole(null);
                setLoading(false);
                return;
            }

            try {
                // Check if we have the role in the custom claims or profile first? 
                // Firestore is safer for now as we don't have custom claims set up.
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserData;
                    setRole(userData.role);
                } else {
                    setRole("user"); // Default
                }
            } catch (error) {
                console.error("Role check failed", error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { role, loading, isAdmin: role === 'admin' };
}
