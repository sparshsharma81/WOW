import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";

// Force same-origin requests so auth cookies are shared with Next.js server components.
export const client = hc<AppType>("");
