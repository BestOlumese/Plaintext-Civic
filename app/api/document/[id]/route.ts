import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;

    // Check if the document belongs to the user
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
    }

    // Delete the document (cascade delete handles Simplifications and GlossaryTerms)
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete Document Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
