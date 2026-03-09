import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/appwrite";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedToken = process.env.KEEP_ALIVE_TOKEN;
  const receivedToken = request.headers.get("x-keep-alive-token");

  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "keep-alive token is not configured" },
      { status: 503 },
    );
  }

  if (!receivedToken || receivedToken !== expectedToken) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { users } = await createAdminClient();

    // A tiny read against Appwrite keeps the project active.
    await users.list();

    return NextResponse.json(
      { ok: true, provider: "appwrite" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "keep-alive failed";

    return NextResponse.json(
      { ok: false, error: message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  }
}
