# Link Generator Architecture

## Overview
This project allows users to create permanent redirect links forwarding to WhatsApp numbers.

## Tech Stack
- **Frontend**: Next.js 16 (App Router) on Vercel
- **Backend/Auth**: Firebase Auth, Firestore
- **Redirect Engine**: Firebase Cloud Functions (HTTP v2/v1)

## Folder Structure
- `/app`: Next.js App Router pages (Frontend)
- `/functions`: Firebase Cloud Functions (Backend Logic)
- `/lib`: Shared utilities and Firebase client initialization
- `/types`: Shared TypeScript definitions

## Data Flow
### 1. Link Redirection
User -> `domain.com/w/{slug}` -> Vercel Rewrite -> Cloud Function (`w`) -> Firestore Lookup -> 302 Redirect -> WhatsApp

### 2. User Dashboard
User -> Next.js Frontend -> Firebase SDK -> Firestore (direct read/write with security rules)

## Database Schema (Firestore)
### `users/{uid}`
- `role`: 'user' | 'admin'
- `subscriptionStatus`: 'trial' | 'active' | 'expired'

### `links/{linkId}`
- `slug`: unique string
- `destination`: whatsapp url (or raw number)
- `userId`: owner uid

## Security
- **Firestore Rules**: Strict owner-only access.
- **Cloud Functions**: The only public read-access to the `links` collection (via Admin SDK internally).
