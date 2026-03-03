"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";

const getBaseUrl = async () => {
  const headersList = await headers();

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl;
  }

  const forwardedProto = headersList.get("x-forwarded-proto");
  const forwardedHost = headersList.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = headersList.get("host");
  if (host) {
    return `https://${host}`;
  }

  return "http://localhost:3000";
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
