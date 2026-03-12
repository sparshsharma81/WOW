"use server";

import { redirect } from "next/navigation";

export async function signInWithGithub() {
  return redirect("/api/oauth/github?mode=signin");
}

export async function signInWithGoogle() {
  return redirect("/api/oauth/google?mode=signin");
}

export async function signUpWithGithub() {
  return redirect("/api/oauth/github?mode=signup");
};

export async function signUpWithGoogle() {
  return redirect("/api/oauth/google?mode=signup");
};
