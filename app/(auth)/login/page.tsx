import { SignInForm } from "@/components/auth/signin-form";
import { protectAuthPage } from "@/lib/auth-utils";
import { Shield } from "lucide-react";
import Link from "next/link";

export default async function LoginPage() {
  await protectAuthPage()
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg mb-2">
          <Shield className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">
          Enter your email to sign in to your resident account.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
