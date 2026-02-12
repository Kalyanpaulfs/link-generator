// types/index.ts
// Shared interfaces for the application

export type Role = 'user' | 'admin';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'pending' | 'rejected' | 'none';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    durationInDays: number;
    linkLimit: number;
    description: string;
}

export interface UserData {
    uid: string;
    email: string;
    role: Role;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiry: number; // Timestamp
    planId?: string;
    createdAt?: number;
}

export interface Subscription {
    id?: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: number;
    endDate: number;
    paymentId?: string;
    createdAt: number;
}

export interface Payment {
    id?: string;
    userId: string;
    subscriptionId: string;
    amount: number;
    utrNumber?: string;
    screenshotUrl: string;
    status: PaymentStatus;
    createdAt: number;
    reviewedBy?: string;
    rejectionReason?: string;
}

export interface LinkData {
    id?: string;
    slug: string;
    userId: string;
    whatsappNumber: string;
    customMessage?: string;
    active: boolean;
    clicks?: number;
    createdAt: number;
}

