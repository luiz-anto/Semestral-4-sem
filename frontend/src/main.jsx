import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Simulator from "./pages/Simulator.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).has("simulator") ? (
      <Simulator />
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
