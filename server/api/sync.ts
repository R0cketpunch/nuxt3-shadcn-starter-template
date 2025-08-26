export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === "POST") {
    // Client updating state - broadcast via Pusher
    const body = await readBody(event);
    const pusher = getPusher();

    try {
      if (body.gameState !== undefined) {
        await pusher.trigger("game-channel", "game-state-update", {
          gameState: body.gameState,
          timestamp: Date.now(),
        });
      }

      if (body.settings !== undefined) {
        await pusher.trigger("game-channel", "settings-update", {
          settings: body.settings,
          timestamp: Date.now(),
        });
      }

      if (body.reset) {
        await pusher.trigger("game-channel", "game-reset", {
          timestamp: Date.now(),
        });
      }

      // Timer control events
      if (body.timerAction) {
        const payload: any = {
          action: body.timerAction,
          timestamp: Date.now(),
          serverTime: Date.now(),
        };

        // Include the appropriate value field
        if (body.duration !== undefined) {
          payload.duration = body.duration;
        }
        if (body.timeAdjustment !== undefined) {
          payload.timeAdjustment = body.timeAdjustment;
        }

        await pusher.trigger("game-channel", "timer-action", payload);
      }

      return {
        success: true,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Pusher broadcast error:", error);
      return {
        error: "Failed to broadcast state change",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return { error: "Method not supported" };
});
