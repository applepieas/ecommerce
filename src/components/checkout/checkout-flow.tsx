"use client";

import { useState } from "react";
import { User } from "better-auth"; // Adjust based on actual type export if needed
import CheckoutForm from "./checkout-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

interface CheckoutFlowProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export default function CheckoutFlow({ user }: CheckoutFlowProps) {
  const router = useRouter();
  // If user is logged in, skip login step
  const [step, setStep] = useState<"login" | "form">(user ? "form" : "login");

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.email({
        email,
        password,
      }, {
        onSuccess: () => {
          router.refresh();
          setStep("form");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
        }
      });
    } catch (err) {
      setError("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "login") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-black p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold">Log In</h2>
          <p className="mb-6 text-gray-300">
            Log in to access your saved details and speed up your checkout.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-white py-3 font-bold text-black hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={() => setStep("form")}
            className="mt-6 w-full text-center text-sm text-gray-300 hover:text-white underline underline-offset-4"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  return <CheckoutForm user={user} />;
}
