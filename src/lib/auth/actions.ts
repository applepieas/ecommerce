"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { guest } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signUpSchema, signInSchema } from "./validations";
import { headers } from "next/headers";

const GUEST_COOKIE_NAME = "guest_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Sign up action
export async function signUp(formData: FormData) {
  const rawData = {
    name: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = signUpSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const response = await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
    });

    if (!response) {
      return { error: "Failed to create account" };
    }

    // Merge guest cart if exists
    const cookieStore = await cookies();
    const guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;
    if (guestToken && response.user?.id) {
      await mergeGuestCartWithUserCart(response.user.id, guestToken);
      cookieStore.delete(GUEST_COOKIE_NAME);
    }

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { error: "An error occurred during sign up" };
  }
}

// Sign in action
export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = signInSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const response = await auth.api.signInEmail({
      body: {
        email: result.data.email,
        password: result.data.password,
      },
    });

    if (!response) {
      return { error: "Invalid email or password" };
    }

    // Merge guest cart if exists
    const cookieStore = await cookies();
    const guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;
    if (guestToken && response.user?.id) {
      await mergeGuestCartWithUserCart(response.user.id, guestToken);
      cookieStore.delete(GUEST_COOKIE_NAME);
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "Invalid email or password" };
  }
}

// Sign out action
export async function signOut() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/");
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "Failed to sign out" };
  }
}

// Get or create guest session
export async function getGuestSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (guestToken) {
    // Verify guest session exists in DB
    const guestRecord = await db
      .select()
      .from(guest)
      .where(eq(guest.sessionToken, guestToken))
      .limit(1);

    if (guestRecord.length > 0 && guestRecord[0].expiresAt > new Date()) {
      return guestToken;
    }
  }

  return null;
}

// Create guest session
export async function createGuestSession(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

  // Store in database
  await db.insert(guest).values({
    sessionToken,
    expiresAt,
  });

  // Set cookie
  cookieStore.set(GUEST_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return sessionToken;
}

// Merge guest cart with user cart
export async function mergeGuestCartWithUserCart(
  userId: string,
  guestSessionToken: string
): Promise<void> {
  try {
    // TODO: Implement cart migration logic when cart table is created
    // 1. Fetch guest cart items by guestSessionToken
    // 2. For each item, check if user already has it in cart
    // 3. If yes, update quantity; if no, insert with userId
    // 4. Delete guest cart items
    // 5. Delete guest session from DB

    // For now, just clean up the guest session
    await db.delete(guest).where(eq(guest.sessionToken, guestSessionToken));
  } catch (error) {
    console.error("Failed to merge guest cart:", error);
  }
}
