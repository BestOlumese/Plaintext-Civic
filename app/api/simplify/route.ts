import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { rateLimit } from "@/lib/rate-limit";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply Rate Limiting (5 requests per minute per user)
    const limiter = rateLimit(`simplify:${session.user.id}`, 5, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limiter.limit.toString(),
            "X-RateLimit-Remaining": limiter.remaining.toString(),
            "X-RateLimit-Reset": limiter.reset.toString(),
          }
        }
      );
    }

    const { fileUrl, fileName, fileType, forceLanguage, forceReadingLevel, documentId } = await req.json();

    if (!fileUrl && !documentId) {
      return NextResponse.json({ error: "File URL or Document ID is required" }, { status: 400 });
    }

    console.log(`Processing simplify request for user ${session.user.id}`);

    // Read user preferences as fallback
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredLanguage: true, defaultReadingLevel: true }
    });

    const targetLanguage = forceLanguage || user?.preferredLanguage || "English";
    const readingLevel = forceReadingLevel || user?.defaultReadingLevel || "5th-grade";

    let originalText = "";
    let docId = documentId;

    if (documentId) {
      // Re-translating an existing document
      console.log(`Fetching existing document ${documentId}`);
      const existingDoc = await prisma.document.findUnique({
        where: { id: documentId, userId: session.user.id }
      });
      if (!existingDoc) throw new Error("Document not found");
      originalText = decrypt(existingDoc.originalText);
    } else {
      // 1. Fetch the file buffer from UploadThing URL
      console.log(`Processing new file: ${fileName} (${fileType})`);
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) throw new Error("Failed to fetch file from storage");
      
      // 2. Perform OCR / Text Extraction using Gemini 2.5 Flash
      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");

      // Map MIME types to Gemini supported types for inlineData
      let mimeType = "application/pdf";
      if (fileType.includes("image/jpeg") || fileType.includes("image/jpg")) mimeType = "image/jpeg";
      if (fileType.includes("image/png")) mimeType = "image/png";
      if (fileType.includes("image/webp")) mimeType = "image/webp";

      const extractionPrompt = `
        Please carefully read this document.
        Extract all the text exactly as it appears. Do not summarize or alter the text yet.
        Return ONLY the extracted text.
      `;

      console.log("Starting text extraction via Gemini...");
      const extractionResult = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: extractionPrompt },
              { inlineData: { data: base64Data, mimeType: mimeType } }
            ]
          }
        ]
      });

      originalText = extractionResult.text || "No text could be extracted.";

      // 3. Save the new Document to DB
      const newDoc = await prisma.document.create({
        data: {
          title: encrypt(fileName || "Untitled Document"),
          originalText: encrypt(originalText),
          fileUrl: fileUrl,
          userId: session.user.id,
        }
      });
      docId = newDoc.id;
    }

    // 4. Perform the Simplification & Glossary Extraction
    const simplifyPrompt = `
      You are an expert civic and legal translator for 'PlainText Civic'.
      
      Your task is to rewrite the following dense document based on these strict requirements:
      - Target Complexity Level: ${readingLevel}
      - Target Language: ${targetLanguage}
      
      Formatting Instructions:
      - Make it extremely clear, empathetic, and easy to read.
      - Use markdown formatting (headers, bolding, bullet points).
      - If the document is a form, explain exactly what the user needs to fill out.
      - Never hallucinate data. Only explain what is present in the source text.
      
      Additional Task (Glossary):
      - Identify 3 to 5 complex jargon or legal terms present in the text.
      - Define them very simply.

      Additional Task (Loophole Finder):
      - Identify any unfair terms, hidden fees, rights violations, or unusual clauses.
      - These are "Red Flags".
      
      Additional Task (Visual Redline Mapping):
      - Create an array of mappings where you take a complex or specific phrase from the source text and map it to its corresponding simplified explanation in your output.
      
      Return your response as a JSON object with EXACTLY the following structure:
      {
        "simplifiedText": "The markdown formatted simplified text goes here...",
        "glossary": [
          { "term": "Jargon Word", "definition": "Simple explanation" }
        ],
        "redFlags": [
          { "term": "Short name for the risk", "explanation": "Detailed warning", "severity": "low|medium|high" }
        ],
        "mapping": [
          { "source": "Original complex phrase", "simplified": "Your simplified version" }
        ]
      }
      
      Here is the source text to process:
      """
      ${originalText}
      """
    `;

    console.log("Starting simplification, translation, and breakthrough analysis...", { readingLevel, targetLanguage });
    const simplifyResult = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: simplifyPrompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = simplifyResult.text;
    if (!responseText) throw new Error("Gemini returned empty response");

    const parsedResult = JSON.parse(responseText);

    // 5. Save Simplification to DB (including Red Flags and Mapping)
    const simplification = await prisma.simplification.create({
      data: {
        documentId: docId,
        simplifiedText: encrypt(parsedResult.simplifiedText),
        readingLevel: readingLevel,
        targetLanguage: targetLanguage,
        redFlags: parsedResult.redFlags ? encrypt(JSON.stringify(parsedResult.redFlags)) : null,
        mappingData: parsedResult.mapping ? encrypt(JSON.stringify(parsedResult.mapping)) : null,
      }
    });

    // 6. Save Glossary Terms to DB
    if (parsedResult.glossary && Array.isArray(parsedResult.glossary)) {
      const glossaryTerms = parsedResult.glossary.map((g: any) => ({
        term: g.term,
        definition: encrypt(g.definition),
        simplificationId: simplification.id
      }));
      
      if (glossaryTerms.length > 0) {
        await prisma.glossaryTerm.createMany({
          data: glossaryTerms
        });
      }
    }

    console.log("Successfully processed document!");

    return NextResponse.json({ 
      success: true, 
      documentId: docId,
      simplificationId: simplification.id
    });

  } catch (error: any) {
    console.error("Simplification Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document" },
      { status: 500 }
    );
  }
}
