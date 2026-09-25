import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import BusinessOSEntry from "./BusinessOSEntry";
import BusinessApps from "./BusinessApps";
import IntegrationHub from "./IntegrationHub";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

function resolveRoute(pathname) {
  const normalized = pathname.replace(/\/+$/, "");
  const isBusinessOSRoute = normalized.endsWith("/business-os");
  const appMatch = normalized.match(/\/business-os\/(pos|warehouse|sales|procurement|finance|accounting|reports|alerts|crm|ai|seo|commerce|erp|animals|industry-os)$/);
  const isIntegrationRoute = normalized.endsWith("/business-os/integration-hub");
  return {
    isBusinessOSRoute,
    isBusinessAppRoute: Boolean(appMatch),
    isIntegrationRoute,
    appId: appMatch?.[1] || "launcher"
  };
}

function AppRouter() {
  const [pathname, setPathname] = React.useState(() => window.location.pathname);

  React.useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", sync);
    window.addEventListener("jolie-route-change", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("jolie-route-change", sync);
    };
  }, []);

  const route = resolveRoute(pathname);

  if (route.isIntegrationRoute) {
    return <IntegrationHub onBack={() => navigateBusiness("")} />;
  }

  if (route.isBusinessAppRoute) {
    return <BusinessApps appId={route.appId} onBack={() => navigateBusiness("")} />;
  }

  if (route.isBusinessOSRoute) {
    return <BusinessOSEntry />;
  }

  return <App />;
}

function navigateBusiness(id) {
  const normalizedId = String(id || "").replace(/^\/+|\/+$/g, "");
  const pathname = window.location.pathname;
  const marker = "/business-os";
  const index = pathname.indexOf(marker);
  const base = index >= 0 ? pathname.slice(0, index) + marker + "/" : "/business-os/";
  const target = normalizedId ? base + normalizedId + "/" : base;

  if (window.location.pathname !== target) {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new Event("jolie-route-change"));
  } else {
    window.dispatchEvent(new Event("jolie-route-change"));
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);