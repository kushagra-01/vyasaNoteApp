import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { currentUser } from "@/lib/auth";

export default async function LoginPage() {
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
            Secure notes for teams with role-based access
          </h1>
          <p className="text-lg text-zinc-600">
            Keep your personal notes private or manage org-wide notes as an
            admin. All actions are protected behind authentication.
          </p>
          <p className="text-sm text-zinc-500">
            Need an account?{" "}
            <Link href="/signup" className="font-medium text-zinc-900 underline">
              Sign up
            </Link>
          </p>
        </div>
        <AuthForm mode="signin" />
      </div>
    </main>
  );
}

