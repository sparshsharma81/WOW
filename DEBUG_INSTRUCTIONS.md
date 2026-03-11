# Quick Debug Guide: GET vs POST Issue

## The Problem
Your API requests are showing as **GET in localhost** but **POST in Vercel** (or vice versa).

---

## Root Cause

Your **Hono client** (`src/lib/rpc.ts`) uses:
```typescript
export const client = hc<AppType>("");  // ← Relative URL
```

This causes:
1. **Relative URLs** to be resolved differently on localhost vs Vercel
2. **Hono/client** might interpret the origin differently
3. **Vercel's edge infrastructure** might normalize or rewrite the request method
4. **CORS preflight** requests could be interfering

---

## How to Debug (Step-by-Step)

### Step 1: Enable Debug Logging

In **`src/app/api/[[...route]]/route.ts`**, add the debug middleware at the TOP:

```typescript
import { debugMiddleware } from "@/lib/debug-middleware";  // Add this import

const app = new Hono().basePath("/api");

// Add RIGHT after creating the app instance - BEFORE cors
app.use("*", debugMiddleware);  // ← Add this line

app.use(
  "*",
  cors({
    // ... rest of cors config
  }),
);
```

### Step 2: Use Debug RPC Client

Replace your import in any component that tests API calls:

```typescript
// BEFORE
import { client } from "@/lib/rpc";

// AFTER (temporary)
import { client } from "@/lib/debug-rpc";
```

### Step 3: Test and Observe

1. **On Localhost**:
   - Open browser DevTools → Network tab
   - Filter by `api` 
   - Click a button that makes an API call (e.g., Get Workspaces)
   - **Check**: What method does it show? (GET or POST?)
   - **Check Console**: Look for `[API Debug]` and `[DEBUG MIDDLEWARE]` logs
   - Note the exact request details

2. **On Vercel**:
   - Deploy with debug middleware enabled
   - Open browser DevTools → Network tab
   - Make the same API call
   - **Check**: What method does it show now?
   - **Check Console**: Look for `[API Debug]` logs
   - **Check Vercel Logs**: Look for `[DEBUG MIDDLEWARE]` logs

---

## What to Look For

### Browser Network Tab

```
Request:  GET /api/workspaces
Method:   GET ✓ (Correct)

Request:  POST /api/workspaces  
Method:   POST ✗ (Wrong! Should be GET)
```

### Console Logs

#### Client-side logs (Browser Console)
```
[API Debug] Fetch Request: {
  timestamp: "2026-03-11T...",
  environment: "client",
  url: "http://localhost:3000/api/workspaces",
  requestMethod: "GET",
  ...
}
```

#### Server-side logs (Vercel or Terminal)
```
[DEBUG MIDDLEWARE] Incoming Request: {
  method: "GET",
  path: "/api/workspaces",
  headers: {
    "x-forwarded-for": "1.2.3.4",
    "x-forwarded-proto": "https",
  },
  isVercel: true,
}
```

---

## Diagnosis Checklist

- [ ] **Console Logs Match Network Tab?** 
  - If YES ✓ → Problem is client-side
  - If NO ✗ → Problem is server-side transformation

- [ ] **Same issue on localhost && Vercel?**
  - If YES → Built-in to your code
  - If NO → Vercel-specific transformation

- [ ] **Specific routes affected?**
  - If YES → Check route definitions
  - If NO → Global issue (client or middleware)

- [ ] **Affects GET, POST, or Both?**
  - If GET only → Issue with `.$get()` 
  - If POST only → Issue with `.$post()`
  - If Both → Global fetch/client issue

---

## Most Likely Fixes

### Fix #1: Use Absolute URL (80% chance this is it)
**File**: `src/lib/rpc.ts`

```typescript
import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

// BEFORE
export const client = hc<AppType>("");

// AFTER - Use absolute URL
const baseUrl = 
  typeof window === "undefined" 
    ? (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    : window.location.origin;

export const client = hc<AppType>(baseUrl);
```

### Fix #2: Check `next.config.ts`
Make sure you don't have any request rewriting:

```typescript
// next.config.ts
const nextConfig = {
  // ❌ REMOVE if you see this
  rewrites: async () => {
    return {
      beforeFiles: [
        // Any rewrites that might affect method?
      ],
    };
  },
};
```

### Fix #3: Verify Hono Imports
Make sure you're using the official Hono handler:

```typescript
import { handle } from "hono/vercel";  // ✓ Correct
import { handle } from "hono/node";     // ✗ Wrong for Vercel
```

---

## After Fixing

1. **Remove debug files**:
   - Delete `src/lib/debug-rpc.ts`
   - Delete `src/lib/debug-middleware.ts`
   - Remove debug middleware from `route.ts`

2. **Update imports** back to:
   ```typescript
   import { client } from "@/lib/rpc";
   ```

3. **Verify** on both localhost and Vercel

---

## If Still Not Fixed

Send me the results of:
1. Network tab screenshots (localhost vs Vercel)
2. Console logs from `[API Debug]` 
3. Server logs from `[DEBUG MIDDLEWARE]`
4. The exact endpoint that's having issues
