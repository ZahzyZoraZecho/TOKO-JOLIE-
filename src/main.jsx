import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BusinessOSEntry from "./BusinessOSEntry";
import BusinessApps from "./BusinessApps";
import "./styles.css";

const normalized = window.location.pathname.replace(/\/+$/, "");
const isBusinessOSRoute = normalized.endsWith("/business-os");
const appMatch = normalized.match(/\/business-os\/(pos|warehouse|sales|procurement|finance|crm|ai|commerce|erp)$/);
const isBusinessAppRoute = Boolean(appMatch);

function BusinessAppRoute() {
  const appId = appMatch?.[1] || "launcher";
  return <BusinessApps appId={appId} onBack={() => { window.location.href = "./"; }} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isBusinessAppRoute ? <BusinessAppRoute /> : isBusinessOSRoute ? <BusinessOSEntry /> : <App />}
  </React.StrictMode>
);