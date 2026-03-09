import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import members from "@/features/members/server/route";
import workspaces from "@/features/workspaces/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";

const app = new Hono().basePath("/api");

const allowedOrigins = new Set(
  [
    process.env.CORS_ALLOWED_ORIGINS,
    process.env.NEXT_PUBLIC_APP_URL,
    "https://sparsh10.vercel.app",
    "https://sparshwow.vercel.app",
    "https://wowsparsh.vercel.app",
  ]
    .flatMap((value) => (value ? value.split(",") : []))
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
);

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "";

      const normalizedOrigin = origin.replace(/\/+$/, "");

      return allowedOrigins.has(normalizedOrigin)
        ? origin
        : "";
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/auth", auth)
  .route("/members", members)
  .route("/workspaces", workspaces)
  .route("/projects", projects)
  .route("/tasks", tasks)

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof routes;
