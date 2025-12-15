import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildAuthCookie, hashPassword, signAuthToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const role = body?.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signAuthToken(user);
    const res = NextResponse.json({ user });
    res.cookies.set(buildAuthCookie(token));
    return res;
  } catch (error) {
    console.error("Signup error", error);
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 }
    );
  }
}

