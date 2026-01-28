"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  onSubmit?: (data: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isSignUp = mode === "sign-up";
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (onSubmit) {
      setIsLoading(true);
      try {
        const formData = new FormData(e.currentTarget);
        const result = await onSubmit(formData);

        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          router.refresh();
          router.push("/");
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-body text-red-700">
          {error}
        </div>
      )}
      {/* Full Name (Sign Up only) */}
      {isSignUp && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="fullName"
            className="text-caption font-caption text-dark-900"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-body text-dark-900 placeholder:text-dark-500 focus:border-dark-900 focus:outline-none focus:ring-1 focus:ring-dark-900"
            required
          />
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-caption font-caption text-dark-900"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="johndoe@gmail.com"
          className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body font-body text-dark-900 placeholder:text-dark-500 focus:border-dark-900 focus:outline-none focus:ring-1 focus:ring-dark-900"
          required
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-caption font-caption text-dark-900"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="minimum 8 characters"
            minLength={8}
            className="w-full rounded-lg border border-light-300 bg-light-100 px-4 py-3 pr-12 text-body font-body text-dark-900 placeholder:text-dark-500 focus:border-dark-900 focus:outline-none focus:ring-1 focus:ring-dark-900"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-900"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full rounded-full bg-dark-900 px-6 py-3.5 text-body font-body-medium text-light-100 transition-colors hover:bg-dark-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
      </button>

      {/* Terms */}
      <p className="text-center text-footnote font-footnote text-dark-500">
        By {isSignUp ? "signing up" : "signing in"}, you agree to our{" "}
        <a href="#" className="text-dark-900 underline hover:no-underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-dark-900 underline hover:no-underline">
          Privacy Policy
        </a>
      </p>
    </form>
  );
}
