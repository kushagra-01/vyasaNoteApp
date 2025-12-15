import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  HttpError,
  deleteNoteForUser,
  getNoteForUser,
  updateNoteForUser,
} from "@/lib/notes";

function handleError(error) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Notes detail API error", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  
  try {
    const note = await getNoteForUser(user, params.id);
    return NextResponse.json({ note });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request, { params: paramsPromise }) {
  const params = await paramsPromise; // unwrap the Promise
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!params?.id) {
    return NextResponse.json({ error: "Note id is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const note = await updateNoteForUser(user, params.id, {
      title: body?.title?.trim(),
      description: body?.description?.trim(),
    });
    return NextResponse.json({ note });
  } catch (error) {
    return handleError(error);
  }
}


export async function DELETE(request, { params }) {
  const user = await getUserFromRequest(request);
  try {
    if (!params?.id) {
      return NextResponse.json({ error: "Note id is required" }, { status: 400 });
    }
    await deleteNoteForUser(user, params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

