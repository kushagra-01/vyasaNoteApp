import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  HttpError,
  createNoteForUser,
  listNotesForUser,
} from "@/lib/notes";

function handleError(error) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Notes API error", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export async function GET(request) {
  const user = await getUserFromRequest(request);
  try {
    const notes = await listNotesForUser(user);
    return NextResponse.json({ notes });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  try {
    const body = await request.json();
    const note = await createNoteForUser(user, {
      title: body?.title?.trim(),
      description: body?.description?.trim(),
      userId: body?.userId,
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

