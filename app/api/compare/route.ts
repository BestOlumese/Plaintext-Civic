import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId1, docId2 } = await req.json();

    if (!docId1 || !docId2) {
      return NextResponse.json({ error: "Two document IDs are required for comparison" }, { status: 400 });
    }

    // Fetch both documents
    const [doc1, doc2] = await Promise.all([
      prisma.document.findUnique({ where: { id: docId1, userId: session.user.id } }),
      prisma.document.findUnique({ where: { id: docId2, userId: session.user.id } })
    ]);

    if (!doc1 || !doc2) {
      return NextResponse.json({ error: "One or both documents not found" }, { status: 404 });
    }

    const text1 = decrypt(doc1.originalText);
    const text2 = decrypt(doc2.originalText);

    const comparePrompt = `
      You are an expert civic analyst for 'PlainText Civic'.
      Your task is to compare two versions of a document and explain the differences in Plain English.
      
      Document A (Older Version/Reference):
      """
      ${text1}
      """
      
      Document B (Newer Version/Draft):
      """
      ${text2}
      """
      
      STRICT GUIDELINES:
      - Focus ONLY on meaningful changes (legal rights, fees, deadlines, obligations).
      - Ignore minor formatting or punctuation changes unless they change the meaning.
      - Use simple, clear language.
      - Use markdown for your response (bullet points for deletions and additions).
      - Categorize changes into "What's Gone", "What's New", and "What's the Same".
      - Be empathetic and clear.
    `;

    const model = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: comparePrompt }] }]
    });

    const result = await model;
    const responseText = result.text;

    if (!responseText) throw new Error("AI returned an empty comparison");

    return NextResponse.json({
      comparison: responseText,
      doc1: { title: decrypt(doc1.title), id: docId1 },
      doc2: { title: decrypt(doc2.title), id: docId2 }
    });

  } catch (error: any) {
    console.error("Comparison API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to compare documents" }, { status: 500 });
  }
}
