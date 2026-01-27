import "server-only";
import * as admin from "firebase-admin";

interface FirebaseAdminConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

function formatPrivateKey(key: string) {
    // 1. Handle literal newlines first (common in .env files)
    let formatted = key.replace(/\\n/g, "\n");

    // 2. Extract the PEM block using regex to ignore surrounding quotes/garbage
    const match = formatted.match(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/);

    if (match) {
        return match[0];
    }

    return formatted;
}

export function createFirebaseAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        // In build time or if envs are missing, this might throw or return null.
        // For server actions we expect these to be present.
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

const app = createFirebaseAdminApp();
export const adminDb = app.firestore();
export const adminAuth = app.auth();
