import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { currentUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-5xl grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Vyasha Notes
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Create an account to manage notes
          </h1>
          <p className="text-lg text-zinc-600">
            Choose a role that matches your responsibilities. Admins can manage
            every note; users can manage their own.
          </p>
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-900 underline">
              Log in
            </Link>
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}

