"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { UserData } from "@/types";
import { useRouter } from "next/navigation";

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setIsAdmin(false);
                router.push("/login?redirect=/admin");
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserData;
                    if (userData.role === 'admin') {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                        router.push("/dashboard"); // Unauthorized
                    }
                } else {
                    setIsAdmin(false);
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Admin check failed", error);
                setIsAdmin(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    return { isAdmin };
}
