import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BusinessOSEntry from "./BusinessOSEntry";
import "./styles.css";

const isBusinessOSRoute = window.location.pathname.replace(/\\/+$/, "").endsWith("/business-os");

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isBusinessOSRoute ? <BusinessOSEntry /> : <App />}
  </React.StrictMode>
);