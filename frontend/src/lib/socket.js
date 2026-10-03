import { io } from "socket.io-client";
import { API_URL } from "../config";

export function createSocket(token) {
  const socket = io(API_URL || undefined, {
    auth: { token },
    // WebSocket from the start. Socket.IO's default begins with HTTP long-polling, whose follow-up
    // requests must reach the same backend copy; behind a round-robin load balancer they may not
    // ("Session ID unknown"). A single WebSocket stays on one copy for its whole life, so no
    // sticky sessions are needed (PLAN.md blocker B-5). Trade-off: no fallback for networks that
    // block WebSockets.
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  // A copy that is shutting down closes its connections on purpose ("io server disconnect"),
  // which Socket.IO doesn't retry by itself. Reconnect after a random short delay so everyone it
  // served doesn't hit the remaining copies at the same instant (reconnect storm).
  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      setTimeout(() => socket.connect(), 500 + Math.random() * 2000);
    }
  });

  return socket;
}

// Emit with an acknowledgement, resolving to the server's { ok, error, ... } reply
export function emitWithAck(socket, event, payload, timeoutMs = 8000) {
  return new Promise((resolve) => {
    socket.timeout(timeoutMs).emit(event, payload, (err, reply) => {
      if (err) {
        resolve({ ok: false, error: "The server didn't respond. Check your connection." });
      } else {
        resolve(reply);
      }
    });
  });
}
