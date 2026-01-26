// app/w/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDocs, collection, query, where, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { LinkData, UserData } from "@/types";

// THIS IS A TEMPORARY CLIENT-SIDE REDIRECT FOR LOCAL TESTING ONLY.
// In Production, this will be handled by Firebase Cloud Functions.

export default function LocalRedirectPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [status, setStatus] = useState("Resolving link...");

    useEffect(() => {
        if (!slug) return;

        const resolveLink = async () => {
            try {
                // 1. Lookup Link
                const q = query(collection(db, "links"), where("slug", "==", slug));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setStatus("Link not found (404)");
                    return;
                }

                const linkDoc = snapshot.docs[0];
                const link = linkDoc.data() as LinkData;

                // 2. Active Check
                if (!link.active) {
                    setStatus("Link is disabled by owner.");
                    return;
                }

                // 3. Subscription Check
                const userRef = doc(db, "users", link.userId);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    setStatus("Link owner not found.");
                    return;
                }

                const user = userSnap.data() as UserData;
                const now = Date.now();
                if (user.subscriptionStatus === 'expired' || (user.subscriptionExpiry && user.subscriptionExpiry < now)) {
                    setStatus("Subscription expired.");
                    return;
                }

                // 4. Counts
                await updateDoc(linkDoc.ref, {
                    clicks: increment(1)
                });

                // 5. Redirect
                setStatus("Redirecting...");
                const number = link.whatsappNumber.replace(/[^\d]/g, '');
                window.location.href = `https://wa.me/${number}`;

            } catch (e) {
                console.error(e);
                setStatus("Error resolving link.");
            }
        };

        resolveLink();
    }, [slug]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                <h1 className="text-xl font-bold text-gray-800 mb-2">{status}</h1>
                <p className="text-gray-500 text-sm">Local Testing Mode</p>
            </div>
        </div>
    );
}
