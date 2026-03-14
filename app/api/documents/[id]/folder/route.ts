import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { folderId } = await req.json();
  const { id: docId } = await params;

  // If folderId is provided, verify it belongs to the user
  if (folderId) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: session.user.id }
    });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }
  }

  const document = await prisma.document.update({
    where: {
      id: docId,
      userId: session.user.id,
    },
    data: {
      folderId: folderId || null,
    },
  });

  return NextResponse.json(document);
}
