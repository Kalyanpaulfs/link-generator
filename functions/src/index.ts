import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// --- Types (Duplicated here to avoid build complexity with outside folders) ---
type SubscriptionStatus = 'trial' | 'active' | 'expired';

interface UserData {
    uid: string;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiry: number;
}

interface LinkData {
    userId: string;
    whatsappNumber: string;
    active: boolean;
    slug: string;
}

// --- HTML Templates ---
const errorPage = (title: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 50px; background: #f9fafb; color: #333; }
    h1 { color: #ef4444; }
    p { font-size: 1.1rem; color: #666; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>
`;

export const w = functions.https.onRequest(async (req, res) => {
    // 1. Extract Slug
    // req.path comes as "/slug" or "/"
    const slug = req.path.split("/").pop(); // Simple extraction from end of path

    if (!slug) {
        res.status(400).send(errorPage("Missing Link", "No link identifier provided."));
        return;
    }

    try {
        // 2. Lookup Link
        const linksRef = db.collection("links");
        const snapshot = await linksRef.where("slug", "==", slug).limit(1).get();

        if (snapshot.empty) {
            res.status(404).send(errorPage("Link Not Found", "This link does not exist or has been deleted."));
            return;
        }

        const linkDoc = snapshot.docs[0];
        const link = linkDoc.data() as LinkData;

        // 3. Link Status Check
        if (!link.active) {
            res.status(403).send(errorPage("Link Disabled", "This link has been disabled by the owner."));
            return;
        }

        // 4. User Subscription Check
        const userSnapshot = await db.collection("users").doc(link.userId).get();

        if (!userSnapshot.exists) {
            // Should rare, but possible if user deleted account but link remained
            res.status(404).send(errorPage("Invalid Link", "The owner of this link no longer exists."));
            return;
        }

        const user = userSnapshot.data() as UserData;
        const now = Date.now();
        const isExpired = user.subscriptionStatus === 'expired' || (user.subscriptionExpiry && user.subscriptionExpiry < now);

        if (isExpired) {
            res.status(402).send(errorPage("Subscription Expired", "This link is no longer active due to subscription expiry."));
            return;
        }

        // 5. Success - Redirect
        const number = link.whatsappNumber.replace(/[^\d]/g, ''); // Sanitize just in case
        // Log the click asynchronously (fire and forget, or await if strict analytics needed)
        // We await briefly to ensure execution context doesn't kill it immediately, 
        // but usually standard await is best for functions v1.
        await linkDoc.ref.update({
            clicks: admin.firestore.FieldValue.increment(1)
        });

        res.redirect(302, `https://wa.me/${number}`);

    } catch (error) {
        console.error("Redirect Error:", error);
        res.status(500).send(errorPage("Server Error", "Something went wrong. Please try again later."));
    }
});
