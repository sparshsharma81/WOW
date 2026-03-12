import { OAuthProvider } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/appwrite";

type Provider = "google" | "github";
type Mode = "signin" | "signup";

type OAuthFailureReason =
  | "missing_env"
  | "invalid_redirect"
  | "provider_not_configured"
  | "unknown";

const getOAuthFailureReason = (error: unknown): OAuthFailureReason => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("undefined") || message.includes("missing") || message.includes("required")) {
    return "missing_env";
  }

  if (message.includes("redirect") || message.includes("origin") || message.includes("platform") || message.includes("url")) {
    return "invalid_redirect";
  }

  if (message.includes("oauth") || message.includes("provider") || message.includes("client id") || message.includes("client secret")) {
    return "provider_not_configured";
  }

  return "unknown";
};

const parseMode = (value: string | null): Mode => {
  return value === "signup" ? "signup" : "signin";
};

const parseProvider = (value: string): Provider | null => {
  if (value === "google" || value === "github") {
    return value;
  }

  return null;
};

const getProviderEnum = (provider: Provider): OAuthProvider => {
  return provider === "google" ? OAuthProvider.Google : OAuthProvider.Github;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: rawProvider } = await params;
  const provider = parseProvider(rawProvider.toLowerCase());

  if (!provider) {
    return NextResponse.redirect(new URL("/sign-in?error=unsupported_provider", request.url));
  }

  const mode = parseMode(request.nextUrl.searchParams.get("mode"));
  const failurePath = mode === "signup" ? "/sign-up" : "/sign-in";
  const baseUrl = request.nextUrl.origin.replace(/\/+$/, "");
  const successUrl = `${baseUrl}/oauth`;
  const failureUrl = `${baseUrl}${failurePath}`;

  try {
    const { account } = await createAdminClient();
    const redirectUrl = await account.createOAuth2Token(
      getProviderEnum(provider),
      successUrl,
      failureUrl,
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const reason = getOAuthFailureReason(error);

    console.error(`[OAuthRoute][${provider}] Failed to create OAuth token`, {
      message: error instanceof Error ? error.message : "Unknown error",
      reason,
      mode,
      baseUrl,
      successUrl,
      failureUrl,
      hasEndpoint: Boolean(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
      hasProject: Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT),
      hasApiKey: Boolean(process.env.NEXT_APPWRITE_KEY),
    });

    const redirectPath = `${failurePath}?error=${provider}_oauth_failed&reason=${reason}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }
}
