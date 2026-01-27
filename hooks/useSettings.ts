import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useSettings() {
    const [settings, setSettings] = useState<{ upiId?: string; qrCodeUrl?: string }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docSnap = await getDoc(doc(db, "settings", "global"));
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading };
}
