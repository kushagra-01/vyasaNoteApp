import { NextResponse } from "next/server";
import { buildAuthCookie } from "@/lib/auth";

export async function POST() {
  const cookie = buildAuthCookie("");
  const res = NextResponse.json({ success: true });
  res.cookies.set({ ...cookie, maxAge: 0, value: "" });
  return res;
}

