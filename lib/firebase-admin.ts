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

export function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.apps[0]!;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        // Log locally but don't crash the whole module at build time
        console.warn("Firebase Admin credentials missing. This is normal during build unless these are required for static generation.");
        return null;
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: formatPrivateKey(privateKey),
        }),
    });
}

// Lazy getters to prevent crashes during module evaluation (build time)
export const getAdminDb = () => {
    const app = getAdminApp();
    if (!app) throw new Error("Firestore Admin Database not available - missing credentials.");
    return app.firestore();
};

export const getAdminAuth = () => {
    const app = getAdminApp();
    if (!app) throw new Error("Firebase Admin Auth not available - missing credentials.");
    return app.auth();
};
