import type { authSignIn, authSignUp } from "@/types/backend";

export async function signIn(data: authSignIn) {
  const response = await fetch("/api/auth/sign-in", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message ?? "Login failed");
  }
  const { token } = parsed;

  if (typeof token !== "string") {
    throw new Error("Login failed: no token received");
  }

  return token;
}

/**
 * Sign up a new user for an account.
 *
 * Throws an error if the sign up fails
 * This does not return anything meaningfull.
 * @param data user data to sign up with
 */
export async function signUp(data: authSignUp) {
  const response = await fetch("/api/auth/sign-up", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message ?? "Sign up failed");
  }
}
