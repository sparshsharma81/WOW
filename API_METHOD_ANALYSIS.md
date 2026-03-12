# API Method Analysis: GET vs POST Difference (Localhost vs Vercel)

## Current Setup Overview

### 1. **Hono Client Configuration** (`src/lib/rpc.ts`)
```typescript
export const client = hc<AppType>("");  // Empty string = same-origin requests
```

**Issue**: The comment says "Force same-origin requests so auth cookies are shared"
- Uses relative URLs (empty string `""`)
- Should work correctly on both localhost and Vercel

---

## How HTTP Methods Are Defined

### 2. **Backend Route Definitions** (`src/app/api/[[...route]]/route.ts`)

```typescript
// All HTTP methods are explicitly exported with hono/vercel handler
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
```

---

## Frontend Request Patterns

### 3. **GET Requests** (should stay GET)
**Example**: `use-current.ts`
```typescript
const response = await client.api.auth.current.$get();
```

**Example**: `use-get-workspaces.ts`
```typescript
const response = await client.api.workspaces.$get();
```

### 4. **POST Requests** (should stay POST)
**Example**: `use-login.ts`
```typescript
const response = await client.api.auth.login["$post"]({ json });
```

---

## Possible Root Causes of GET → POST Conversion

### **Issue 1: Hono Client Fetch Behavior**
The hono/client uses `fetch()` API which can behave differently:
- **Localhost**: May keep GET method
- **Vercel**: Browser or middleware might modify request method

**Why this happens:**
- Some middleware/proxies convert GET with body to POST
- Some servers normalize requests
- CORS preflight requests becoming actual requests

### **Issue 2: Client Initialization Problem**
```typescript
export const client = hc<AppType>("");  // Relative URL
```
- On **localhost:3000**: Makes requests to `http://localhost:3000/api/...`
- On **Vercel**: Makes requests to `https://yourdomain.com/api/...`
- Vercel's edge network might reprocess the request

### **Issue 3: CORS Middleware Configuration** 
```typescript
app.use(
  "*",
  cors({
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    // ...
  }),
);
```
- CORS preflight `OPTIONS` requests are being handled
- But the actual request method might be getting modified by Vercel's infrastructure

### **Issue 4: Vercel Edge Function Behavior**
- Vercel serverless functions can modify request methods during edge processing
- Relative URLs might be converted differently than absolute URLs
- Query parameters in GET requests might trigger method conversion

---

## How to Diagnose

### **In Browser DevTools on Vercel:**
1. Open **Network tab** (F12)
2. Make a request (e.g., click button that calls `useCurrent()`)
3. Check the request:
   - **Method**: Should be `GET` but might show `POST`
   - **Headers**: Check `x-forwarded-method` or similar
   - **URL**: Check if it's relative or absolute

### **Add Logging to Backend** (`src/app/api/[[...route]]/route.ts`):
```typescript
app.use("*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  console.log("Headers:", Object.fromEntries(c.req.raw.headers));
  await next();
});
```

---

## Recommended Fixes

### **Fix 1: Use Absolute URLs Instead of Relative URLs**
```typescript
// src/lib/rpc.ts - BEFORE
export const client = hc<AppType>("");

// src/lib/rpc.ts - AFTER
const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // Server-side
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
  // Client-side - use current origin
  return window.location.origin;
};

export const client = hc<AppType>(getBaseUrl());
```

### **Fix 2: Explicitly Add Request Headers to Root Endpoint**
```typescript
// src/app/api/[[...route]]/route.ts
app.use("*", async (c, next) => {
  // Preserve original method
  c.header("x-method", c.req.method);
  await next();
});
```

### **Fix 3: Force Fetch Options in Hono Client**
```typescript
// src/lib/rpc.ts
export const client = hc<AppType>("", {
  fetch: (input, init) => {
    // Force method preservation
    return fetch(input, {
      ...init,
      method: init?.method, // Explicit
      headers: {
        ...init?.headers,
        "x-method-override": init?.method,
      },
    });
  },
});
```

### **Fix 4: Check Vercel Deployment Configuration**
In **vercel.json** or **next.config.ts**:
```typescript
// next.config.ts
const nextConfig = {
  swcMinify: true,
  // Ensure API routes are not modified
  api: {
    responseLimit: false,
  },
};
```

---

## Key Files to Monitor

1. **`src/lib/rpc.ts`** - Client initialization
2. **`src/app/api/[[...route]]/route.ts`** - Request handler
3. **Browser DevTools Network tab** - Actual requests being sent
4. **Vercel deployment logs** - Server-side processing

---

## Testing Checklist

- [ ] Check Network tab on Vercel: Is GET actually becoming POST?
- [ ] Add server-side logging to verify received method
- [ ] Test with absolute URL in rpc.ts
- [ ] Check if specific routes are affected (only GET? only POST?)
- [ ] Verify CORS headers being sent
- [ ] Check Vercel function logs for request method

