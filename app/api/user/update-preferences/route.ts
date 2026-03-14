import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferredLanguage, defaultReadingLevel } = await req.json();

    // Update the custom fields in our database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferredLanguage,
        defaultReadingLevel,
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
