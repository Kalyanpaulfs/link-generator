import { getAdminDb } from "@/lib/firebase-admin";
import { type NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const dynamic = 'force-dynamic';

interface LinkData {
    userId: string;
    whatsappNumber: string;
    active: boolean;
    slug: string;
}

interface UserData {
    uid: string;
    subscriptionStatus: 'trial' | 'active' | 'expired';
    subscriptionExpiry: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    if (!slug) {
        return new NextResponse("Missing Link", { status: 400 });
    }

    try {
        // 1. Lookup Link
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.error("Firebase Admin credentials missing");
            return new NextResponse("Server Configuration Error: Missing Credentials", { status: 500 });
        }

        const linksRef = adminDb.collection("links");
        const snapshot = await linksRef.where("slug", "==", slug).limit(1).get();

        if (snapshot.empty) {
            return new NextResponse("Link Not Found", { status: 404 });
        }

        const linkDoc = snapshot.docs[0];
        const link = linkDoc.data() as LinkData;

        // 2. Link Status Check
        if (!link.active) {
            return new NextResponse("Link Disabled", { status: 403 });
        }

        // 3. User Subscription Check
        // 3. User Subscription Check
        const userSnapshot = await adminDb.collection("users").doc(link.userId).get();

        if (!userSnapshot.exists) {
            return new NextResponse("Invalid Link Owner", { status: 404 });
        }

        const user = userSnapshot.data() as UserData;
        const now = Date.now();
        const isExpired = user.subscriptionStatus === 'expired' ||
            (user.subscriptionExpiry && user.subscriptionExpiry < now);

        if (isExpired) {
            return new NextResponse("Subscription Expired", { status: 402 });
        }

        // 4. Success - Update Stats
        // We don't await this to speed up redirect? Vercel Functions might kill it. 
        // Safer to await.
        await linkDoc.ref.update({
            clicks: admin.firestore.FieldValue.increment(1)
        });

        const number = link.whatsappNumber.replace(/[^\d]/g, '');

        // 5. Redirect
        return NextResponse.redirect(`https://wa.me/${number}`);

    } catch (error) {
        console.error("Redirect Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
