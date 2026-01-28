import Link from "next/link";
import SocialProviders from "@/components/SocialProviders";
import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Header Link */}
      <p className="mb-8 text-center text-caption font-caption text-dark-700">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-bold text-dark-900 underline hover:no-underline"
        >
          Sign Up
        </Link>
      </p>

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-heading-3 font-heading-3 leading-heading-3 text-dark-900">
          Welcome Back!
        </h1>
        <p className="text-body font-body text-dark-700">
          Sign in to continue your fitness journey
        </p>
      </div>

      {/* Social Providers */}
      <SocialProviders action="sign-in" />

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-light-300" />
        <span className="text-caption font-caption text-dark-500">
          Or sign in with
        </span>
        <div className="h-px flex-1 bg-light-300" />
      </div>

      {/* Form */}
      <AuthForm mode="sign-in" />
    </div>
  );
}
