import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BusinessOSEntry from "./BusinessOSEntry";
import BusinessApps from "./BusinessApps";
import IntegrationHub from "./IntegrationHub";
import "./styles.css";

const normalized = window.location.pathname.replace(/\/+$/, "");
const isBusinessOSRoute = normalized.endsWith("/business-os");
const appMatch = normalized.match(/\/business-os\/(pos|warehouse|sales|procurement|finance|accounting|reports|alerts|crm|ai|seo|commerce|erp)$/);
const isBusinessAppRoute = Boolean(appMatch);
const isIntegrationRoute = normalized.endsWith("/business-os/integration-hub");

function BusinessAppRoute() {
  const appId = appMatch?.[1] || "launcher";
  return <BusinessApps appId={appId} onBack={() => { window.location.href = "./"; }} />;
}

function IntegrationRoute() {
  return <IntegrationHub onBack={() => { window.location.href = "./"; }} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isIntegrationRoute ? <IntegrationRoute /> : isBusinessAppRoute ? <BusinessAppRoute /> : isBusinessOSRoute ? <BusinessOSEntry /> : <App />}
  </React.StrictMode>
);