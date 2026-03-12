"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";

const getBaseUrl = async () => {
  const headersList = await headers();

  const normalize = (value: string) => value.replace(/\/+$/, "");

  const forwardedProtoRaw = headersList.get("x-forwarded-proto") ?? "https";
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

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return normalize(envUrl);
  }

  return normalize("http://localhost:3000");
};

export async function signUpWithGithub() {
  try {
    const { account } = await createAdminClient();
    const baseUrl = await getBaseUrl();

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Github,
      `${baseUrl}/oauth`,
      `${baseUrl}/sign-up`,
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("[OAuth][GitHub] Failed to create OAuth token", {
      message: error instanceof Error ? error.message : "Unknown error",
      baseUrl: await getBaseUrl(),
      hasEndpoint: Boolean(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
      hasProject: Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT),
      hasApiKey: Boolean(process.env.NEXT_APPWRITE_KEY),
    });

    return redirect("/sign-in?error=github_oauth_failed");
  }
};

export async function signUpWithGoogle() {
  try {
    const { account } = await createAdminClient();
    const baseUrl = await getBaseUrl();

    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Google,
      `${baseUrl}/oauth`,
      `${baseUrl}/sign-up`,
    );

    return redirect(redirectUrl);
  } catch (error) {
    console.error("[OAuth][Google] Failed to create OAuth token", {
      message: error instanceof Error ? error.message : "Unknown error",
      baseUrl: await getBaseUrl(),
      hasEndpoint: Boolean(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
      hasProject: Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT),
      hasApiKey: Boolean(process.env.NEXT_APPWRITE_KEY),
    });

    return redirect("/sign-in?error=google_oauth_failed");
  }
};
