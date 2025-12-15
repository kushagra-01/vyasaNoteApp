import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const TOKEN_NAME = "token";
const ONE_WEEK = 60 * 60 * 24 * 7;

function ensureSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(user) {
  ensureSecret();
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ONE_WEEK }
  );
}

export function verifyAuthToken(token) {
  ensureSecret();
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function buildAuthCookie(token) {
  return {
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK,
  };
}

export async function getUserFromRequest(request) {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  const payload = verifyAuthToken(token);
  if (!payload?.userId) return null;
  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function currentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload?.userId) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  });
}


