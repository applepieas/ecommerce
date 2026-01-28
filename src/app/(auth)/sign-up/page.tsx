import Link from "next/link";
import SocialProviders from "@/components/SocialProviders";
import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Header Link */}
      <p className="mb-8 text-center text-caption font-caption text-dark-700">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-bold text-dark-900 underline hover:no-underline"
        >
          Sign In
        </Link>
      </p>

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-heading-3 font-heading-3 leading-heading-3 text-dark-900">
          Join Nike Today!
        </h1>
        <p className="text-body font-body text-dark-700">
          Create your account to start your fitness journey
        </p>
      </div>

      {/* Social Providers */}
      <SocialProviders action="sign-up" />

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-light-300" />
        <span className="text-caption font-caption text-dark-500">
          Or sign up with
        </span>
        <div className="h-px flex-1 bg-light-300" />
      </div>

      {/* Form */}
      <AuthForm mode="sign-up" />
    </div>
  );
}
