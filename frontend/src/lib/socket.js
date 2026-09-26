import { io } from "socket.io-client";
import { API_URL } from "../config";

export function createSocket(token) {
  return io(API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });
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
