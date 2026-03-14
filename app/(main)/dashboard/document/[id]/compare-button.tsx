"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ArrowRightLeft, Loader2, FileText, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
}

export function CompareDocumentButton({ currentDocId }: { currentDocId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        // Exclude current document
        setDocuments(data.filter((d: any) => d.id !== currentDocId));
      }
    } catch (error) {
      toast.error("Failed to load documents for comparison");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedDocId) return;
    setIsComparing(true);
    setComparisonResult(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        body: JSON.stringify({ docId1: currentDocId, docId2: selectedDocId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Comparison failed");
      }

      const data = await res.json();
      setComparisonResult(data.comparison);
      toast.success("Comparison complete!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open && documents.length === 0) fetchDocuments();
    }}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="gap-2 rounded-full shadow-lg shadow-blue-500/20 px-3 sm:px-5 group active:scale-95 transition-all">
          <ArrowRightLeft className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          <span className="max-sm:hidden inline">Compare Revisions</span>
        </Button>
      </DialogTrigger>
      {/* Added positioning classes here (fixed, top, left, transforms) */}
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-0 shadow-2xl">
        <DialogHeader className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 backdrop-blur-md">
          <DialogTitle className="flex items-center gap-4 text-2xl font-black tracking-tight">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <ArrowRightLeft className="h-6 w-6 text-white" />
            </div>
            Smart Revision Analysis
          </DialogTitle>
          <p className="text-sm font-medium text-slate-500 mt-2">Compare versions to see meaningful changes in plain English.</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!comparisonResult ? (
            <>
              {isLoadingDocs ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center p-12 space-y-4">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                  <p className="text-slate-500">No other documents found to compare with.</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                        selectedDocId === doc.id 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" 
                          : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-900/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <span className="font-semibold text-sm">{doc.title}</span>
                      </div>
                      {selectedDocId === doc.id && <Check className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
             <div className="prose prose-slate dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 mb-6 font-sans">
                 <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">AI Comparison Analysis</h4>
                 <div className="text-[13px] leading-relaxed prose-p:mb-3 prose-li:mb-1">
                   <ReactMarkdown>
                     {comparisonResult}
                   </ReactMarkdown>
                 </div>
               </div>
             </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          {comparisonResult ? (
            <Button onClick={() => setComparisonResult(null)} variant="outline" className="rounded-xl">
              Compare Another
            </Button>
          ) : (
            <Button 
              disabled={!selectedDocId || isComparing} 
              onClick={handleCompare}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-8"
            >
              {isComparing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRightLeft className="h-4 w-4 mr-2" />}
              Compare Now
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}