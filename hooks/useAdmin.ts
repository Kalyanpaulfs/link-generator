"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getDb, getClientAuth } from "@/lib/firebase";
import { UserData } from "@/types";
import { useRouter } from "next/navigation";

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getClientAuth(), async (user) => {
            if (!user) {
                setIsAdmin(false);
                setIsSuperAdmin(false);
                router.push("/login?redirect=/admin");
                return;
            }

            try {
                const userDoc = await getDoc(doc(getDb(), "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data() as UserData;
                    const role = userData.role;
                    if (role === 'admin' || role === 'super_admin') {
                        setIsAdmin(true);
                        setIsSuperAdmin(role === 'super_admin');
                    } else {
                        setIsAdmin(false);
                        setIsSuperAdmin(false);
                        router.push("/dashboard"); // Unauthorized
                    }
                } else {
                    setIsAdmin(false);
                    setIsSuperAdmin(false);
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Admin check failed", error);
                setIsAdmin(false);
                setIsSuperAdmin(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    return { isAdmin, isSuperAdmin };
}
