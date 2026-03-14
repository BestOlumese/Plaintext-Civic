import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReadingRoomClient } from "./client-page";
import { decrypt } from "@/lib/encryption";

export default async function DocumentReadingRoom({ params }: { params: { id: string } }) {
  // Wait for headers to be available (Next.js 15 requirement)
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    return notFound();
  }

  // Await the params object (Next.js 15 requirement)
  const resolvedParams = await params;
  const documentId = resolvedParams.id;

  // Fetch the document and its simplification
  const document = await prisma.document.findUnique({
    where: { 
      id: documentId,
      userId: session.user.id // Security: ensure user owns this doc
    },
    include: {
      simplifications: {
        include: {
          glossaryTerms: true
        },
        orderBy: {
          createdAt: 'desc' // Get the most recent simplification
        },
        take: 1
      }
    }
  }) as any; // Cast to any to bypass the faulty Prisma type inference for the include block

  if (!document) {
    return notFound();
  }

  // Decrypt everything for the user
  const decryptedDoc = {
    ...document,
    title: decrypt(document.title),
    originalText: decrypt(document.originalText),
    simplifications: document.simplifications.map((s: any) => ({
      ...s,
      simplifiedText: decrypt(s.simplifiedText),
      redFlags: s.redFlags ? JSON.parse(decrypt(s.redFlags)) : null,
      mappingData: s.mappingData ? JSON.parse(decrypt(s.mappingData)) : null,
      glossaryTerms: s.glossaryTerms.map((g: any) => ({
        ...g,
        definition: decrypt(g.definition)
      }))
    }))
  };

  return <ReadingRoomClient document={decryptedDoc} />;
}
