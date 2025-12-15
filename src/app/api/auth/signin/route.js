import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildAuthCookie, signAuthToken, verifyPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signAuthToken(user);
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set(buildAuthCookie(token));
    return res;
  } catch (error) {
    console.error("Signin error", error);
    return NextResponse.json(
      { error: "Unable to sign in" },
      { status: 500 }
    );
  }
}

