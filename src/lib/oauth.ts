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
	const { account } = await createAdminClient();
  const baseUrl = await getBaseUrl();
  
	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Github,
		`${baseUrl}/oauth`,
		`${baseUrl}/sign-up`,
	);

	return redirect(redirectUrl);
};

export async function signUpWithGoogle() {
	const { account } = await createAdminClient();
  const baseUrl = await getBaseUrl();

	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Google,
		`${baseUrl}/oauth`,
		`${baseUrl}/sign-up`,
	);

	return redirect(redirectUrl);
};
