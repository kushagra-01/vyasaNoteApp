import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function Home() {
  const user = await currentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Vyasha Notes
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-zinc-900">
              Role-based notes with admin control and secure access
            </h1>
            <p className="text-lg text-zinc-600">
              Sign up as an admin to manage every note in your workspace or join
              as a user to keep your personal notes organized. Powered by
              Next.js and PostgreSQL.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-800 transition hover:border-zinc-300"
              >
                I already have an account
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                What&apos;s inside
              </h2>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li>• Email/password auth with JWT + HttpOnly cookies</li>
                <li>• Role-aware CRUD for notes (admin vs user)</li>
                <li>• Next.js App Router + Tailwind styling</li>
                <li>• PostgreSQL schema managed via Prisma</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
