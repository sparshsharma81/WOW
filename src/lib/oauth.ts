"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";

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

const getErrorMetadata = (error: unknown) => {
  const errorObject = error as { code?: number; type?: string } | null;

  return {
    message: error instanceof Error ? error.message : "Unknown error",
    code: errorObject?.code,
    type: errorObject?.type,
  };
};

const getBaseUrl = async () => {
  const headersList = await headers();

  const normalize = (value: string) => value.replace(/\/+$/, "");

  // Prefer an explicit app URL to avoid host/proxy drift between local, preview, and production.
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return normalize(envUrl);
  }

  const hostHeader = headersList.get("host") ?? "";
  const isLocalHost = hostHeader.includes("localhost") || hostHeader.includes("127.0.0.1");
  const defaultProto = isLocalHost || process.env.NODE_ENV !== "production" ? "http" : "https";

  const forwardedProtoRaw = headersList.get("x-forwarded-proto") ?? defaultProto;
  const forwardedHostRaw = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const forwardedProto = forwardedProtoRaw.split(",")[0]?.trim();
  const forwardedHost = forwardedHostRaw?.split(",")[0]?.trim();

  if (forwardedProto && forwardedHost) {
    return normalize(`${forwardedProto}://${forwardedHost}`);
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return normalize(`https://${vercelUrl}`);
  }

  return normalize("http://localhost:3000");
};

const startOAuth = async (
  provider: OAuthProvider,
  failurePath: "/sign-in" | "/sign-up",
  providerLabel: "Google" | "GitHub",
) => {
  try {
    const { account } = await createAdminClient();
    const baseUrl = await getBaseUrl();
    const successUrl = `${baseUrl}/oauth`;
    const failureUrl = `${baseUrl}${failurePath}`;

    const redirectUrl = await account.createOAuth2Token(
      provider,
      successUrl,
      failureUrl,
    );

    return redirect(redirectUrl);
  } catch (error) {
    const baseUrl = await getBaseUrl();
    const errorMetadata = getErrorMetadata(error);
    const reason = getOAuthFailureReason(error);
    const failureUrl = `${baseUrl}${failurePath}`;
    const providerSlug = providerLabel.toLowerCase();

    console.error(`[OAuth][${providerLabel}] Failed to create OAuth token`, {
      ...errorMetadata,
      reason,
      baseUrl,
      successUrl: `${baseUrl}/oauth`,
      failureUrl,
      hasEndpoint: Boolean(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
      hasProject: Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT),
      hasApiKey: Boolean(process.env.NEXT_APPWRITE_KEY),
    });

    return redirect(`${failurePath}?error=${providerSlug}_oauth_failed&reason=${reason}`);
  }
};

export async function signInWithGithub() {
  return startOAuth(OAuthProvider.Github, "/sign-in", "GitHub");
}

export async function signInWithGoogle() {
  return startOAuth(OAuthProvider.Google, "/sign-in", "Google");
}

export async function signUpWithGithub() {
  return startOAuth(OAuthProvider.Github, "/sign-up", "GitHub");
};

export async function signUpWithGoogle() {
  return startOAuth(OAuthProvider.Google, "/sign-up", "Google");
};
