import "server-only";
import * as admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, "\n");
}

export function createFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Missing Firebase Admin credentials in environment variables.");
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formatPrivateKey(privateKey),
        }),
    });
}

// Lazy initialization to avoid build-time errors if env vars are missing
export function getAdminDb() {
    try {
        return createFirebaseAdminApp().firestore();
    } catch {
        return null;
    }
}
