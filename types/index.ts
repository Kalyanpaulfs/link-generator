// types/index.ts
// Shared interfaces for the application

export type Role = 'user' | 'admin';
export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export interface UserData {
    uid: string;
    email: string;
    role: Role;
    subscriptionStatus: SubscriptionStatus;
    subscriptionExpiry: number; // Timestamp
    createdAt?: number;
}

export interface LinkData {
    id?: string;
    slug: string;
    userId: string;
    whatsappNumber: string;
    active: boolean;
    clicks?: number;
    createdAt: number;
}
