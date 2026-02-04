'use server'

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';

// Initialize Nodemailer Transporter
// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port: Number(process.env.SMTP_PORT?.trim()),
    secure: Number(process.env.SMTP_PORT?.trim()) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER?.trim(),
        pass: process.env.SMTP_PASS?.trim(),
    },
});

export async function sendOtp(email: string, type: 'login' | 'signup' = 'signup') {
    // Validate SMTP Configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("Critical: Missing SMTP Environment Variables (SMTP_HOST, SMTP_USER, or SMTP_PASS)");
        return { success: false, error: "Server misconfiguration: Email service not available." };
    }

    // DEBUG: Safe logging to check if vars are loaded correctly (do not log actual values)
    console.log("DEBUG SMTP CONFIG:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        userLength: process.env.SMTP_USER?.length,
        passLength: process.env.SMTP_PASS?.length,
        userStart: process.env.SMTP_USER?.substring(0, 3) + '...' // First 3 chars only
    });

    try {
        if (!email) throw new Error("Email is required");

        // If Login Flow: Check if user exists first
        if (type === 'login') {
            try {
                await adminAuth.getUserByEmail(email);
            } catch (e) {
                // User not found
                return { success: false, error: "No account found with this email. Please Sign Up first." };
            }
        }

        // If Signup Flow: Check if user already exists (optional, but good UX)
        if (type === 'signup') {
            try {
                await adminAuth.getUserByEmail(email);
                // If we get here, user exists
                // We let them proceed but they won't create a new account
            } catch (e) {
                // User doesn't exist, which is correct for signup
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store in Firestore otps collection
        await adminDb.collection('otps').doc(email).set({
            otp,
            expiresAt,
            email
        });

        // Send Email via Nodemailer
        // Note: The 'from' email must be the one verified in Brevo
        const info = await transporter.sendMail({
            from: `"Link Generator" <kalyanpaulfs@gmail.com>`,
            to: email,
            subject: 'Your Login Code',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>${type === 'login' ? 'Login Verification' : 'Create Account'}</h2>
          <p>Enter the following code to ${type === 'login' ? 'sign in' : 'verify your email'}:</p>
          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${otp}</span>
          </div>
          <p style="color: #71717a; font-size: 14px;">This code will expire in 5 minutes.</p>
        </div>
      `
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true };

    } catch (error: any) {
        console.error('Send OTP Error:', error);
        return { success: false, error: error.message || 'Failed to send verification code.' };
    }
}

export async function verifyOtp(email: string, otp: string, type: 'login' | 'signup' = 'signup') {
    try {
        const docRef = adminDb.collection('otps').doc(email);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return { success: false, error: 'No code found for this email. Please request a new one.' };
        }

        const data = docSnap.data();

        if (!data || data.otp !== otp) {
            return { success: false, error: 'Invalid verification code.' };
        }

        if (Date.now() > data.expiresAt) {
            return { success: false, error: 'Code has expired. Please request a new one.' };
        }

        // OTP is valid. Remove it immediately to prevent reuse
        await docRef.delete();

        // Check if user exists
        let uid;
        let isNewUser = false;

        try {
            const userRecord = await adminAuth.getUserByEmail(email);
            uid = userRecord.uid;
        } catch (e) {
            // User does not exist.

            // If login flow, reject.
            if (type === 'login') {
                return { success: false, error: "No account found. Please Sign Up." };
            }

            // Create user ONLY if type is signup
            if (type === 'signup') {
                try {
                    const newUser = await adminAuth.createUser({
                        email,
                        emailVerified: true
                    });
                    uid = newUser.uid;
                    isNewUser = true;
                } catch (createError: any) {
                    console.error("Error creating user", createError);
                    return { success: false, error: "Failed to create user account." };
                }
            } else {
                return { success: false, error: "Authentication failed." };
            }
        }

        // If new user, initialize Firestore data
        if (isNewUser) {
            await adminDb.collection('users').doc(uid).set({
                uid: uid,
                email: email,
                role: "user",
                subscriptionStatus: "none",
                subscriptionExpiry: 0,
                createdAt: Date.now(),
            });
        }

        // Generate Custom Token for client-side login
        const token = await adminAuth.createCustomToken(uid);

        return { success: true, token, isNewUser };
    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return { success: false, error: error.message || 'Verification failed.' };
    }
}
