# Google OAuth Setup Instructions

## Step 1: Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application** as the application type
6. Copy your **Client ID**

## Step 2: Configure OAuth Settings

### Authorized JavaScript origins
Add these URLs (one per line):
```
http://localhost:3001
http://127.0.0.1:3001
https://your-production-domain.com
```

### Authorized redirect URIs
Add these URLs (one per line):
```
http://localhost:3001
http://127.0.0.1:3001
https://your-production-domain.com
```

**Note:** This app runs on port 3001 to avoid conflicts with other projects that may use ports 3000 or 5173.

**Important:** When deploying to production, replace `your-production-domain.com` with your actual domain.

## Step 3: Update Environment Variables

### Frontend (.env in fiverrfront/)
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_URL=http://localhost:4000
```

### Backend (.env in fiverrback/)
```
GOOGLE_CLIENT_ID=your-google-client-id-here
PORT=4000
ALLOWED_DOMAINS=bmsce.ac.in,bmsca.org,bmscl.ac.in
```

## Step 4: Allowed Email Domains

The app is configured to accept sign-ins from:
- @bmsce.ac.in
- @bmsca.org
- @bmscl.ac.in

Make sure these domains are configured in your Google OAuth consent screen settings if you want to restrict access.

## Network Links for Production

When hosting your app, make sure to add:
- Your production frontend URL (e.g., `https://yourdomain.com`)
- Your production backend URL (e.g., `https://api.yourdomain.com`)

Both should be added to:
- Authorized JavaScript origins
- Authorized redirect URIs

## Testing Locally

1. Start the backend: `cd fiverrback && npm run dev`
2. Start the frontend: `cd fiverrfront && npm run dev`
3. The app will be available at `http://localhost:3000`
4. Click the Google Sign-In button in the top right
5. Sign in with an allowed email domain

