import AuthForm from "@/components/AuthForm";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-light-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-8 inline-block">
            <Image
              src="/logo.svg"
              alt="Nike"
              width={60}
              height={22}
              className="h-8 w-auto"
            />
          </Link>
          <h1 className="mb-2 text-title-3 font-title-3 uppercase text-dark-900">
            Your Account for Everything Nike
          </h1>
          <p className="text-body font-body text-dark-500">
            Sign in to access your profile and wishlist.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-6 shadow-sm sm:rounded-lg sm:p-8">
          <AuthForm mode="sign-in" onSubmit={signIn} redirectTo="/profile" />
        </div>
      </div>
    </div>
  );
}
