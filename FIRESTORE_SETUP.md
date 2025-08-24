# Firestore Security Rules Setup Instructions

## Problem

Your Firestore database is showing "Missing or insufficient permissions" errors because the security rules are too restrictive.

## Solution

You need to update your Firestore security rules to allow authenticated users to access their data.

## Steps to Fix:

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with the content from `firestore.rules` file
6. Click "Publish" to save the changes

### Option 2: Using Firebase CLI (If you have it installed)

```powershell
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done already)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Current Rules Content

The rules in `firestore.rules` file allow:

- ✅ Users to read/write their own user documents (`/users/{userId}`)
- ✅ Authenticated users to access test documents (for debugging)
- ✅ Users to access their own transactions and orders
- ❌ No public access (secure)

## For Development Only (Temporary Fix)

If you want to temporarily allow all authenticated users to read/write everything (NOT for production), you can uncomment these lines in the rules:

```javascript
// Temporary: Allow all reads and writes for development (REMOVE IN PRODUCTION!)
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

## Security Notes

- Never use `allow read, write: if true;` in production (allows unauthenticated access)
- Always restrict access to user's own data using `request.auth.uid`
- Test your rules thoroughly before deploying to production
