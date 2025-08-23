# Real-time Cross-Device Synchronization

This application now supports real-time synchronization between multiple devices using WebSockets.

## How It Works

1. **WebSocket Server**: A WebSocket server runs on port 3001 (configurable via `NUXT_WS_PORT`)
2. **Client Connection**: Each browser tab/device connects to the WebSocket server automatically
3. **State Broadcasting**: When game state changes on one device, it's immediately broadcast to all other connected devices
4. **Connection Status**: The navbar shows the current connection status with a colored indicator

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

1. Start the development server: `npm run dev`
2. Open the app on multiple devices (laptop, phone, tablet)
3. Make changes on one device and watch them appear instantly on others
4. Connection status is visible in the top-right corner

## Configuration

Set the WebSocket port in your environment:

```bash
# .env
NUXT_WS_PORT=3001
```

## Technical Details

- Uses native WebSocket API (no external dependencies like Socket.io)
- Server runs alongside Nuxt development/production server
- Broadcasts game state, settings, and reset events
- Each client gets a unique ID for message routing
- Inactive connections are cleaned up automatically