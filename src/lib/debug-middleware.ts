// src/lib/debug-middleware.ts - Add this temporary debugging middleware

import { createMiddleware } from "hono/factory";

export const debugMiddleware = createMiddleware(async (c, next) => {
  const startTime = Date.now();
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: c.req.method,
    path: c.req.path,
    url: c.req.url,
    headers: {
      "content-type": c.req.header("content-type"),
      "x-forwarded-for": c.req.header("x-forwarded-for"),
      "x-forwarded-proto": c.req.header("x-forwarded-proto"),
      "x-forwarded-host": c.req.header("x-forwarded-host"),
      "user-agent": c.req.header("user-agent"),
      origin: c.req.header("origin"),
      referer: c.req.header("referer"),
    },
    isLocalhost: c.req.header("x-forwarded-host")?.includes("localhost") ?? false,
    isVercel: !!process.env.VERCEL || !!process.env.VERCEL_URL,
  };
  
  console.log("[DEBUG MIDDLEWARE] Incoming Request:", JSON.stringify(debugInfo, null, 2));
  
  // Add response interceptor logging
  const originalText = c.text.bind(c);
  const originalJson = c.json.bind(c);
  
  c.text = function(...args) {
    const duration = Date.now() - startTime;
    console.log(`[DEBUG MIDDLEWARE] Response: ${c.req.method} ${c.req.path} - ${duration}ms`);
    return originalText(...args);
  };
  
  c.json = function(...args) {
    const duration = Date.now() - startTime;
    console.log(`[DEBUG MIDDLEWARE] Response: ${c.req.method} ${c.req.path} - ${duration}ms`);
    return originalJson(...args);
  };
  
  await next();
});
