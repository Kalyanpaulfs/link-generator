// hooks/useUserData.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserData } from "@/types";

export function useUserData() {
    const { user, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setUserData(null);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setUserData(doc.data() as UserData);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    return { user, userData, loading };
}
