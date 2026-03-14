"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ExportPdfButton } from "./export-button";
import { ReTranslateButton } from "./re-translate-button";
import { TTSPlayer } from "./tts-player";
import { ThemeToggle } from "@/components/theme-toggle";

import { DocumentChat } from "./document-chat";

export function ReadingRoomClient({
  document,
  initialSimplifications,
}: {
  document: any;
  initialSimplifications: any[];
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const activeSimplification = document.simplifications?.[0];

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8 max-w-[1400px]">
      {/* Header Area */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {document.title}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                {activeSimplification?.readingLevel || "Original"}
              </span>
              <span>•</span>
              <span>{activeSimplification?.targetLanguage || "English"}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <ReTranslateButton documentId={document.id} />
              <ExportPdfButton
                targetRef={contentRef}
                documentTitle={document.title}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Node specifically for clean PDF Export without Tailwind Oklab colors */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div
          ref={contentRef}
          style={{
            width: "800px",
            padding: "40px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontFamily: "sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#0f172a",
            }}
          >
            {document.title} - Simplified
          </h1>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#1e3a8a",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "8px",
            }}
          >
            Plaintext Translation
          </h2>
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              color: "#1e293b",
              marginBottom: "40px",
            }}
          >
            {activeSimplification ? (
              <ReactMarkdown>
                {activeSimplification.simplifiedText}
              </ReactMarkdown>
            ) : (
              <p>Processing...</p>
            )}
          </div>

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#334155",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "8px",
            }}
          >
            Original Text
          </h2>
          <div
            style={{
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              color: "#475569",
              marginBottom: "40px",
              fontFamily: "monospace",
            }}
          >
            {document.originalText}
          </div>

          {activeSimplification?.glossaryTerms &&
            activeSimplification.glossaryTerms.length > 0 && (
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    color: "#0f172a",
                  }}
                >
                  Glossary
                </h2>
                {activeSimplification.glossaryTerms.map((term: any) => (
                  <div
                    key={term.id}
                    style={{
                      marginBottom: "12px",
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#0f172a",
                        fontSize: "14px",
                      }}
                    >
                      {term.term}
                    </strong>
                    <span style={{ fontSize: "13px", color: "#334155" }}>
                      {term.definition}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-3xl">
        {/* Main Reading Area (Side by side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Original Text */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/80 flex flex-col h-[calc(100vh-280px)]">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-4 flex-none rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <FileText className="h-5 w-5 text-slate-400" />
                Original Text
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {document.originalText}
            </CardContent>
          </Card>

          {/* Right Column: Simplified Translation */}
          <Card className="border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-slate-900 flex flex-col h-[calc(100vh-280px)] transition-all">
            <CardHeader className="border-b border-blue-100 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-900/20 px-6 py-4 flex-none rounded-t-xl flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-300">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Plaintext Translation
              </CardTitle>
              {activeSimplification && (
                <TTSPlayer text={activeSimplification.simplifiedText} />
              )}
            </CardHeader>
            <CardContent className="p-8 overflow-y-auto flex-1 prose prose-slate dark:prose-invert prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 max-w-none">
              {activeSimplification ? (
                <ReactMarkdown>
                  {activeSimplification.simplifiedText}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p>Simplification is still processing...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Glossary Section */}
        {activeSimplification?.glossaryTerms &&
          activeSimplification.glossaryTerms.length > 0 && (
            <div className="mt-12 mb-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Key Terms Glossary
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSimplification.glossaryTerms.map(
                  (term: { id: string; term: string; definition: string }) => (
                    <Card
                      key={term.id}
                      className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-600 transition-colors"
                    >
                      <CardContent className="p-5">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                          {term.term}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {term.definition}
                        </p>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </div>
          )}
      </div>

      <DocumentChat documentId={document.id} />
    </div>
  );
}
