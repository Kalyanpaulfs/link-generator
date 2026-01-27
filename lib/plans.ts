import { Plan } from "@/types";

export const PLANS: Plan[] = [
    {
        id: 'free-trial',
        name: 'Free Trial',
        price: 0,
        currency: 'INR',
        durationInDays: 14,
        linkLimit: 1,
        description: 'Test the platform for 14 days. No credit card required.',
    },
    // Basic Plans
    {
        id: 'basic-monthly',
        name: 'Basic Monthly',
        price: 499,
        currency: 'INR',
        durationInDays: 30,
        linkLimit: 1,
        description: 'Perfect for individuals.',
    },
    {
        id: 'basic-quarterly',
        name: 'Basic Quarterly',
        price: 1399,
        currency: 'INR',
        durationInDays: 90,
        linkLimit: 1,
        description: 'Save on 3 months.',
    },
    {
        id: 'basic-annual',
        name: 'Basic Annual',
        price: 4999,
        currency: 'INR',
        durationInDays: 365,
        linkLimit: 1,
        description: 'Best value for individuals.',
    },
    // Pro Plans
    {
        id: 'pro-monthly',
        name: 'Pro Monthly',
        price: 1499,
        currency: 'INR',
        durationInDays: 30,
        linkLimit: 5,
        description: 'For growing businesses.',
    },
    {
        id: 'pro-annual',
        name: 'Pro Annual',
        price: 14999,
        currency: 'INR',
        durationInDays: 365,
        linkLimit: 5,
        description: 'Maximum power for agencies.',
    },
];

export const getPlan = (id: string) => PLANS.find(p => p.id === id);
