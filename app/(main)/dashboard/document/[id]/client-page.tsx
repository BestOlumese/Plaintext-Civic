"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, FileText, ShieldAlert } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ExportPdfButton } from "./export-button";
import { ReTranslateButton } from "./re-translate-button";
import { TTSPlayer } from "./tts-player";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

import { DocumentChat } from "./document-chat";
import { CompareDocumentButton } from "./compare-button";

export function ReadingRoomClient({
  document,
}: {
  document: any;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const activeSimplification = document.simplifications?.[0];
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Helper logic to render text with synchronized highlights
  const renderHighlightedText = (text: string, type: 'original' | 'simplified') => {
    if (!activeSimplification?.mappingData || !Array.isArray(activeSimplification.mappingData)) {
      return text;
    }
    
    // We want to apply all highlights. To avoid recursive splitting issues, 
    // we'll track which parts are already highlighted.
    let segments: { text: string; highlightId: string | null }[] = [{ text, highlightId: null }];

    activeSimplification.mappingData.forEach((m: any) => {
      const target = type === 'original' ? m.source : m.simplified;
      if (!target || target.length < 3) return; // Ignore very short mappings

      const newSegments: typeof segments = [];
      segments.forEach(seg => {
        if (seg.highlightId !== null) {
          newSegments.push(seg);
          return;
        }

        // Only split if the target exists in this un-highlighted segment
        if (seg.text.includes(target)) {
          const parts = seg.text.split(target);
          parts.forEach((part, i) => {
            if (part) newSegments.push({ text: part, highlightId: null });
            if (i < parts.length - 1) {
              newSegments.push({ text: target, highlightId: m.source });
            }
          });
        } else {
          newSegments.push(seg);
        }
      });
      segments = newSegments;
    });

    return segments.map((seg, i) => (
      seg.highlightId ? (
        <span
          key={i}
          onMouseEnter={() => setActiveHighlight(seg.highlightId)}
          onMouseLeave={() => setActiveHighlight(null)}
          className={cn(
            "transition-all duration-200 cursor-help px-0.5 rounded border-b-2 decoration-amber-500/50 underline-offset-4",
            activeHighlight === seg.highlightId
              ? "bg-amber-200/60 dark:bg-amber-900/40 text-amber-950 dark:text-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-sm"
              : "bg-amber-100/10 dark:bg-amber-900/5 border-transparent"
          )}
        >
          {seg.text}
        </span>
      ) : (
        <span key={i}>{seg.text}</span>
      )
    ));
  };

  const HighlightText = ({ text, type }: { text: string; type: 'original' | 'simplified' }) => {
    return <>{renderHighlightedText(text, type)}</>;
  };

  // Components for ReactMarkdown to support highlights
  const MarkdownComponents = {
    p: ({ children }: any) => <p>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</p>,
    li: ({ children }: any) => <li>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</li>,
    h1: ({ children }: any) => <h1>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</h1>,
    h2: ({ children }: any) => <h2>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</h2>,
    h3: ({ children }: any) => <h3>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</h3>,
    strong: ({ children }: any) => <strong>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</strong>,
    em: ({ children }: any) => <em>{typeof children === 'string' ? renderHighlightedText(children, 'simplified') : children}</em>,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50">
      {/* Header Area */}
      <div className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-2xl bg-slate-100/30 dark:bg-slate-800/30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 active:scale-95">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="space-y-0.5 animate-in fade-in slide-in-from-left-4 duration-500">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-md">
                {document.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-black">Reading Room</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <ThemeToggle />
            </div>
            <CompareDocumentButton currentDocId={document.id} />
            <ReTranslateButton documentId={document.id} />
            <ExportPdfButton targetRef={contentRef} documentTitle={document.title} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Main Reading Area (Simplified) */}
          <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            {/* Loophole Finder / Red Flags Section - PREMIUM GLASSMORPISM */}
            {activeSimplification?.redFlags && activeSimplification.redFlags.length > 0 && (
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-rose-500/20 to-amber-500/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                
                <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-rose-100/50 dark:border-rose-900/30 rounded-[32px] p-8 lg:p-10 shadow-2xl shadow-rose-500/5 overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 -transe-y-1/2 translate-x-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-rose-500/10 dark:bg-rose-500/20 p-3 rounded-2xl ring-1 ring-rose-500/20 shadow-inner">
                      <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Loophole Finder</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hidden risks & unfair clauses detected</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-5">
                    {activeSimplification.redFlags.map((flag: any, idx: number) => (
                      <div key={idx} className="group/item relative bg-white/50 dark:bg-slate-800/30 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 hover:border-rose-200/50 dark:hover:border-rose-800/50 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 text-[15px]">{flag.term}</span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ring-1",
                            flag.severity === 'high' ? "bg-rose-50 text-rose-600 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-800/50" :
                            flag.severity === 'medium' ? "bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/50" :
                            "bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-800/50"
                          )}>
                            {flag.severity} RISK
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{flag.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative transition-all duration-500 hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.12)]">
              <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 h-2 w-full" />
              <div className="p-6 lg:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-slate-100 dark:border-slate-800 pb-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 p-3 rounded-2xl">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-black text-[10px] text-blue-600 uppercase tracking-[0.3em] mb-1 block">Translation</span>
                      <h4 className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-slate-100">Plaintext Version</h4>
                    </div>
                  </div>
                  {activeSimplification && (
                    <div className="flex items-center gap-3">
                       <p className="text-xs font-bold text-slate-400 mr-2 hidden md:block">LISTEN TO DOCUMENT</p>
                       <TTSPlayer text={activeSimplification.simplifiedText} />
                    </div>
                  )}
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-[1.8] lg:prose-p:text-[19px] prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-900 dark:prose-headings:text-white prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 space-y-6 max-h-[65vh] overflow-y-auto pr-6 custom-scrollbar">
                   {activeSimplification ? (
                     <ReactMarkdown components={MarkdownComponents}>
                       {activeSimplification.simplifiedText}
                     </ReactMarkdown>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
                        <p className="font-bold text-slate-400">Perfecting your simplification...</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Original Document / Sidebar */}
          <div className="lg:col-span-5 space-y-10 sticky top-32 animate-in fade-in slide-in-from-right-8 duration-700 delay-150 ease-out">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                   <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg">
                     <FileText className="h-4 w-4 text-white dark:text-slate-900" />
                   </div>
                   <span className="font-black text-[11px] tracking-widest text-slate-900 dark:text-slate-100 uppercase">Original Document</span>
                </div>
              </div>
              <div className="p-8 max-h-[55vh] overflow-y-auto bg-slate-50/40 dark:bg-slate-900/40 custom-scrollbar">
                <div className="text-[13px] font-serif leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap select-text opacity-70 italic tracking-wide">
                  <HighlightText text={document.originalText} type="original" />
                </div>
              </div>
            </div>

            {/* Glossary Section */}
            {activeSimplification?.glossaryTerms && activeSimplification.glossaryTerms.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-px flex-1 bg-slate-200 dark:border-slate-800" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Vocabulary</h4>
                  <div className="h-px flex-1 bg-slate-200 dark:border-slate-800" />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {activeSimplification.glossaryTerms.map((term: any) => (
                    <Card key={term.id} className="group border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-md">
                      <CardContent className="p-5">
                        <p className="font-black text-slate-900 dark:text-white text-[14px] mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {term.term}
                        </p>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{term.definition}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentChat documentId={document.id} />
      
      {/* Hidden Node for PDF Export */}
      <div style={{ display: 'none' }}>
        <div ref={contentRef} className="p-10 bg-white text-black font-sans w-[800px]">
          <h1 className="text-3xl font-bold mb-4">{document.title}</h1>
          <h2 className="text-xl font-bold mb-4 text-blue-900 border-b-2 border-slate-200 pb-2">Simplified Translation</h2>
          <div className="text-lg leading-relaxed mb-10">
            {activeSimplification?.simplifiedText}
          </div>
          <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-200 pb-2">Original Text</h2>
          <div className="text-sm italic text-slate-600 mb-10 whitespace-pre-wrap">
            {document.originalText}
          </div>
          {activeSimplification?.glossaryTerms && activeSimplification.glossaryTerms.length > 0 && (
             <div>
               <h2 className="text-xl font-bold mb-4">Glossary</h2>
               {activeSimplification.glossaryTerms.map((g: any) => (
                 <div key={g.id} className="mb-4 p-4 border border-slate-200 rounded-lg">
                   <p className="font-bold mb-1">{g.term}</p>
                   <p className="text-sm">{g.definition}</p>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
