"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({ mode = "signin" }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpoint =
      mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";

    try {
      const payload = {
        email: form.email,
        password: form.password,
      };

      if (isSignup) {
        payload.name = form.name;
        payload.role = form.role;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Auth error", err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-zinc-500">
          {isSignup
            ? "Sign up to start taking notes"
            : "Sign in to continue to your notes"}
        </p>
      </div>

      {isSignup && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange("name")}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 shadow-inner focus:border-zinc-400 focus:outline-none"
            placeholder="Jane Doe"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange("email")}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 shadow-inner focus:border-zinc-400 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1">
        <label
          className="text-sm font-medium text-zinc-700"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange("password")}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 shadow-inner focus:border-zinc-400 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {isSignup && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange("role")}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 shadow-inner focus:border-zinc-400 focus:outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs text-zinc-500">
            Admins can manage every note; users can only manage their own.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Please wait..." : isSignup ? "Sign up" : "Sign in"}
      </button>
    </form>
  );
}

