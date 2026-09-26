import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/ibm-plex-sans/400";
import "@fontsource/ibm-plex-sans/500";
import "@fontsource/ibm-plex-sans/600";
import "@fontsource/ibm-plex-serif/500";
import "@fontsource/ibm-plex-serif/500-italic";
import "@fontsource/ibm-plex-mono/400";
import "./styles/index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
