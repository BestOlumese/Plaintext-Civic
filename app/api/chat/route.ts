import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { rateLimit } from "@/lib/rate-limit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply Rate Limiting (10 chat messages per minute)
    const limiter = rateLimit(`chat:${session.user.id}`, 10, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment." },
        { status: 429 }
      );
    }

    const { message, documentId } = await req.json();

    if (!message || !documentId) {
      return NextResponse.json({ error: "Message and Document ID are required" }, { status: 400 });
    }

    // 1. Fetch document context
    const document = await prisma.document.findUnique({
      where: { id: documentId, userId: session.user.id },
      include: {
        simplifications: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const originalText = decrypt(document.originalText);
    const latestSimplification = document.simplifications[0] 
      ? decrypt(document.simplifications[0].simplifiedText) 
      : "No simplification available yet.";

    // 2. Fetch recent chat history (last 10 messages)
    const history = await prisma.chatMessage.findMany({
      where: { documentId, userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 20
    });

    const formattedHistory = history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: decrypt(msg.content) }]
    }));

    // 3. Prepare AI Prompt with context
    const systemPrompt = `
      You are 'PlainText Civic AI Assistant'. You are helping a user understand a specific document.
      
      CONTEXT DOCUMENT (Original):
      """
      ${originalText}
      """
      
      SIMPLIFIED VERSION:
      """
      ${latestSimplification}
      """
      
      STRICT GUIDELINES:
      - Answer questions ONLY based on the provided document context.
      - If the answer isn't in the document, say "I'm sorry, that information isn't in this specific document."
      - Keep your answers clear, helpful, and empathetic.
      - Use simple language (5th-8th grade level).
      - Use markdown for clarity (bullet points, bolding).
      - Do NOT mention that you are an AI; act as a helpful civic assistant.
    `;

    // 4. Generate AI Response using Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready to help you with this document. What would you like to know?" }] },
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const responseText = result.text;

    if (!responseText) {
      throw new Error("AI returned an empty response.");
    }

    // 5. Save Both Messages (Encrypted) to DB
    await prisma.chatMessage.createMany({
      data: [
        {
          role: "user",
          content: encrypt(message),
          documentId,
          userId: session.user.id
        },
        {
          role: "assistant",
          content: encrypt(responseText),
          documentId,
          userId: session.user.id
        }
      ]
    });

    return NextResponse.json({
      role: "assistant",
      content: responseText
    });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { documentId, userId: session.user.id },
      orderBy: { createdAt: "asc" }
    });

    const decryptedMessages = messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: decrypt(msg.content),
      createdAt: msg.createdAt
    }));

    return NextResponse.json(decryptedMessages);

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
