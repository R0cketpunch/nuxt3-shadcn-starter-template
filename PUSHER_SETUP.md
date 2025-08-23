# Pusher Real-Time Sync Setup

For the best real-time experience, use Pusher instead of SSE/WebSocket. Pusher provides instant, reliable cross-device synchronization.

## Quick Setup

### 1. Create Pusher Account
1. Go to [pusher.com](https://pusher.com)
2. Sign up for a free account
3. Create a new app/channel

### 2. Get Your Credentials
From your Pusher dashboard, you'll need:
- App ID
- Key (public)
- Secret (private)
- Cluster (e.g., `us2`, `eu`, `ap3`)

### 3. Configure Environment Variables

Create a `.env` file with your Pusher credentials:

```bash
# Pusher Configuration
NUXT_PUBLIC_PUSHER_KEY=your_pusher_key_here
NUXT_PUBLIC_PUSHER_CLUSTER=us2
NUXT_PUSHER_APP_ID=your_app_id_here
NUXT_PUSHER_SECRET=your_secret_here
```

**Note**: `NUXT_PUBLIC_` variables are exposed to the client, `NUXT_` variables are server-only.

### 4. Deploy
```bash
vercel deploy
```

Set the same environment variables in Vercel:
- Go to your project settings
- Add the environment variables
- Redeploy

## How It Works

### Connection Priority
1. **Pusher** (if configured) - Instant real-time sync ⚡
2. **WebSocket** (local development) - Fast local sync
3. **SSE** (fallback) - Works on serverless platforms

### Features
- **Instant sync**: Changes appear immediately on all devices
- **No connection cycling**: Persistent connection
- **Reliable**: Enterprise-grade infrastructure
- **Scalable**: Handles unlimited concurrent users

### Connection Status
The navbar will show:
- **PUSHER** - Using Pusher (best experience)
- **WEBSOCKET** - Using WebSocket (local dev)
- **SSE** - Using Server-Sent Events (fallback)

## Pusher Free Tier

Perfect for personal/small projects:
- 100 concurrent connections
- 200,000 messages/day
- Unlimited apps

## Testing

1. Open your app on laptop: `https://your-app.vercel.app`
2. Open same URL on phone
3. Make changes on one device
4. Changes appear **instantly** on the other device
5. Check navbar shows "PUSHER" connection type

Your game will now have **true instant real-time synchronization**! 🚀