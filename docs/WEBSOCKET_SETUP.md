# Real-time Cross-Device Synchronization

This application supports real-time synchronization between multiple devices using different technologies based on the deployment environment.

## Dual-Mode Implementation

### Local Development (WebSocket)
- Uses native WebSocket server on port 3001
- Full bidirectional real-time communication
- Suitable for local development with persistent server

### Production/Vercel (Server-Sent Events)
- Uses Server-Sent Events (SSE) for real-time updates
- Works with serverless functions on Vercel
- One-way streaming from server to client with API calls for updates

## How It Works

1. **Environment Detection**: Automatically detects local vs production environment
2. **Client Connection**: Each browser tab/device connects using the appropriate method
3. **State Broadcasting**: Game state changes are broadcast to all connected devices
4. **Connection Status**: The navbar shows connection status and type (WebSocket/SSE)

## Connection States

- 🟢 **Connected**: Real-time sync is active
- 🟡 **Connecting**: Attempting to establish connection
- 🔴 **Error**: Connection failed, will attempt to reconnect
- ⚫ **Offline**: Not connected to WebSocket server

## Features

### Automatic Reconnection
- Automatically attempts to reconnect if connection is lost
- Heartbeat system to detect connection health
- 3-second delay between reconnection attempts

### Fallback Support
- localStorage synchronization still works for same-device multi-tab sync
- WebSocket adds cross-device synchronization on top of existing functionality

### Error Handling
- Graceful degradation when WebSocket server is unavailable
- Connection status indicator provides clear feedback
- No functionality loss when offline

## Usage

### Local Development
1. Start the development server: `npm run dev`
2. WebSocket server automatically starts on port 3001
3. Open `http://localhost:3000` on multiple devices on the same network
4. Changes sync instantly via WebSocket

### Production (Vercel)
1. Deploy to Vercel: `vercel deploy`
2. Open the deployed URL on multiple devices
3. Changes sync via Server-Sent Events (SSE)
4. Connection status shows "SSE" in the navbar

The system automatically detects the environment and uses the appropriate technology.

## Configuration

Set the WebSocket port in your environment:

```bash
# .env
NUXT_WS_PORT=3001
```

## Technical Details

### WebSocket Mode (Local)
- Uses native WebSocket API (no external dependencies like Socket.io)
- Server runs alongside Nuxt development server on port 3001
- Full bidirectional communication with heartbeat system
- Each client gets a unique ID for message routing

### SSE Mode (Production/Vercel)
- Uses Server-Sent Events for server-to-client streaming
- API endpoints handle client-to-server updates via POST requests
- Compatible with Vercel's serverless function architecture
- Connections automatically close after 25 seconds to avoid Vercel timeout
- Faster reconnection (1-second delay) to maintain real-time sync

### Common Features
- Broadcasts game state, settings, and reset events
- Automatic reconnection with exponential backoff
- Connection status indicator with type display
- Graceful fallback to localStorage for same-device sync