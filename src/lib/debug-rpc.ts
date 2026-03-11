// src/lib/debug-rpc.ts - Add this temporary debugging wrapper

import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

const originalFetch = global.fetch;

// Intercept all fetch calls to log method conversions
const debugFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  const method = init?.method || "GET";
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    environment: typeof window === "undefined" ? "server" : "client",
    url,
    requestMethod: method,
    headers: init?.headers,
    body: init?.body ? `${String(init.body).substring(0, 100)}...` : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
    protocol: typeof window !== "undefined" ? window.location.protocol : "N/A",
  };
  
  console.log("[API Debug] Fetch Request:", logEntry);
  
  return originalFetch(input, init).then((response) => {
    console.log("[API Debug] Response:", {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  }).catch((error) => {
    console.error("[API Debug] Request Error:", { url, method, error });
    throw error;
  });
};

// Replace global fetch with debug version (only in development)
if (process.env.NODE_ENV === "development") {
  global.fetch = debugFetch as typeof fetch;
}

// Create Hono client
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
  return window.location.origin;
};

const baseUrl = getBaseUrl();

export const client = hc<AppType>(baseUrl);

console.log("[RPC Init] Using base URL:", baseUrl);
console.log("[RPC Init] Environment:", typeof window === "undefined" ? "server" : "client");
