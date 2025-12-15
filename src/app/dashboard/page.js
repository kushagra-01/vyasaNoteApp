import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import { currentUser } from "@/lib/auth";
import { listNotesForUser } from "@/lib/notes";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const notes = await listNotesForUser(user);
  const serializedNotes = notes.map((note) => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt?.toISOString?.(),
  }));

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <DashboardClient initialNotes={serializedNotes} user={user} />
      </div>
    </main>
  );
}

