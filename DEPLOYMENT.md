# Deployment Guide for Vercel

## Quick Deploy

1. **Build and Deploy**:
   ```bash
   npm run build
   vercel deploy
   ```

2. **Test the SSE Connection**:
   After deployment, check the connection status in the navbar. You should see:
   - Connection type: "SSE" 
   - Status: Connected (green dot)

## Troubleshooting

### If SSE connections keep disconnecting:
- This is normal on Vercel - connections cycle every 15 seconds
- Connections automatically reconnect in 100ms for instant recovery
- Heartbeat every 2 seconds ensures fast connection monitoring
- The app maintains state through localStorage as fallback

### If synchronization isn't working:
1. Check browser developer console for errors
2. Verify the `/api/sse` endpoint is responding
3. Test with: `curl https://your-app.vercel.app/api/sse?stream=true`

### Connection States:
- 🟢 **Connected**: Real-time sync active via SSE
- 🟡 **Connecting**: Establishing SSE connection
- 🔴 **Error**: SSE failed, will auto-retry
- ⚫ **Offline**: No connection (fallback to localStorage)

## Environment Differences

| Feature | Local (WebSocket) | Production (SSE) |
|---------|------------------|------------------|
| Connection Type | Persistent WebSocket | Server-Sent Events |
| Reconnection | Every 3 seconds | 100ms |
| Connection Duration | Indefinite | ~15 seconds |
| Bidirectional | Yes | No (uses POST for client→server) |
| Server Resource | Dedicated WebSocket server | Serverless functions |

## Performance Notes

- SSE connections cycle every 15 seconds with 100ms reconnection
- Sub-second real-time experience on Vercel
- Heartbeat every 2 seconds ensures fast connection monitoring
- Aggressive reconnection strategy maintains continuous sync
- localStorage provides instant same-device multi-tab sync