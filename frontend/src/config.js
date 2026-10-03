// Product name lives here so it can be changed in one place
export const APP_NAME = "ChatScale";

// Where the backend is. Empty means "the same address that served this page" — used when a load
// balancer serves the app and forwards /api and /socket.io to the backend copies (docker compose).
export const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:5001";
