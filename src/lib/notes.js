import prisma from "./prisma";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function assertUser(user) {
  if (!user) {
    throw new HttpError(401, "Not authenticated");
  }
}

function assertNoteAccess(user, note) {
  if (!note) {
    throw new HttpError(404, "Note not found");
  }
  if (user.role !== "ADMIN" && note.userId !== user.id) {
    throw new HttpError(403, "You are not allowed to access this note");
  }
}

function assertNoteId(id) {
  if (!id) {
    throw new HttpError(400, "Note id is required");
  }
}

export async function listNotesForUser(user) {
  assertUser(user);
  const where = user.role === "ADMIN" ? {} : { userId: user.id };
  return prisma.note.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createNoteForUser(user, data) {
  assertUser(user);
  const targetUserId =
    user.role === "ADMIN" && data.userId ? data.userId : user.id;

  if (!data.title || !data.description) {
    throw new HttpError(400, "Title and description are required");
  }

  return prisma.note.create({
    data: {
      title: data.title,
      description: data.description,
      userId: targetUserId,
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
}

export async function getNoteForUser(user, id) {
  assertUser(user);
  assertNoteId(id);
  const note = await prisma.note.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
  assertNoteAccess(user, note);
  return note;
}

export async function updateNoteForUser(user, id, data) {
  assertUser(user);
  assertNoteId(id);
  const note = await prisma.note.findUnique({ where: { id } });
  assertNoteAccess(user, note);

  return prisma.note.update({
    where: { id },
    data: {
      title: data.title ?? note.title,
      description: data.description ?? note.description,
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });
}

export async function deleteNoteForUser(user, id) {
  assertUser(user);
  assertNoteId(id);
  const note = await prisma.note.findUnique({ where: { id } });
  assertNoteAccess(user, note);
  await prisma.note.delete({ where: { id } });
  return { success: true };
}

