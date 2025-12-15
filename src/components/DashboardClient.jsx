"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function DashboardClient({ initialNotes = [], user }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [form, setForm] = useState({ title: "", description: "", userId: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  // Use a fixed locale/timezone to avoid server/client hydration mismatches.
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "medium",
        timeZone: "UTC",
      }),
    []
  );

  const sortedNotes = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notes]
  );

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
      };

      if (isAdmin && form.userId) {
        payload.userId = form.userId;
      }

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Unable to create note");
        setBusy(false);
        return;
      }
      setNotes((prev) => [data.note, ...prev]);
      setForm({ title: "", description: "", userId: "" });
    } catch (err) {
      console.error(err);
      setMessage("Unable to create note");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditForm({ title: note.title, description: note.description });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/notes/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Unable to update note");
        setBusy(false);
        return;
      }
      setNotes((prev) =>
        prev.map((note) => (note.id === editingId ? data.note : note))
      );
      setEditingId(null);
      setEditForm({ title: "", description: "" });
    } catch (err) {
      console.error(err);
      setMessage("Unable to update note");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Unable to delete note");
        setBusy(false);
        return;
      }
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (err) {
      console.error(err);
      setMessage("Unable to delete note");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">Signed in as</p>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {user?.name} <span className="text-sm font-normal text-zinc-500">({user?.role})</span>
          </h1>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
        >
          Sign out
        </button>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">Create note</h2>
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            {isAdmin ? "Admin" : "User"}
          </span>
        </div>
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 shadow-inner focus:border-zinc-400 focus:outline-none"
              placeholder="Meeting notes"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 shadow-inner focus:border-zinc-400 focus:outline-none"
              rows={3}
              placeholder="Details, todos, and context..."
            />
          </div>
          {isAdmin && (
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-zinc-700" htmlFor="userId">
                Assign to user (optional user id)
              </label>
              <input
                id="userId"
                name="userId"
                value={form.userId}
                onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 shadow-inner focus:border-zinc-400 focus:outline-none"
                placeholder="Leave blank to assign to yourself"
              />
            </div>
          )}
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {busy ? "Working..." : "Save note"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Notes</h2>
          <p className="text-sm text-zinc-500">
            {isAdmin ? "All notes in the system" : "Notes you own"}
          </p>
        </div>

        {message && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {message}
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sortedNotes.map((note) => {
                const isEditing = editingId === note.id;
                const ownerLabel =
                  note?.user?.name || note?.user?.email || note.userId;

                return (
                  <tr key={note.id} className="align-top">
                    <td className="px-3 py-2 font-medium text-zinc-900">
                      {isEditing ? (
                        <input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="w-full rounded border border-zinc-200 px-2 py-1 text-sm"
                        />
                      ) : (
                        note.title
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-600">
                      {isEditing ? (
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full rounded border border-zinc-200 px-2 py-1 text-sm"
                          rows={2}
                        />
                      ) : (
                        note.description
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-600">{ownerLabel}</td>
                    <td className="px-3 py-2 text-zinc-500">
                      {dateFormatter.format(new Date(note.createdAt))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleUpdate}
                            disabled={busy}
                            className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:border-emerald-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:border-zinc-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(note)}
                            className="rounded border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            disabled={busy}
                            className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:border-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sortedNotes.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-sm text-zinc-500"
                    colSpan={5}
                  >
                    No notes yet. Create your first note above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

