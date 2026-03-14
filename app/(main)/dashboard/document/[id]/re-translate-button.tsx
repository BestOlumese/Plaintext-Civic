"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Languages, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReTranslateButton({ documentId }: { documentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("Spanish");
  const [readingLevel, setReadingLevel] = useState("5th-grade");
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRetranslate = async () => {
    setIsProcessing(true);
    setIsOpen(false);
    toast.loading("Re-translating document...", { id: "retranslate", duration: 100000 });

    try {
      const response = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          forceLanguage: preferredLanguage,
          forceReadingLevel: readingLevel
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Translation failed");
      
      toast.success("Document successfully translated!", { id: "retranslate", duration: 4000 });
      router.refresh();
      
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.", { id: "retranslate", duration: 4000 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className="flex items-center gap-2 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200"
      >
        <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{isProcessing ? "Translating..." : "Re-Translate"}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">New Translation Settings</h4>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" /> Target Language
              </label>
              <select 
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full text-sm bg-slate-50 border-0 rounded-lg px-3 py-2 text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
                <option value="Mandarin">中文 (Mandarin)</option>
                <option value="Tagalog">Tagalog</option>
                <option value="Arabic">العربية (Arabic)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Complexity Level
              </label>
              <select 
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value)}
                className="w-full text-sm bg-slate-50 border-0 rounded-lg px-3 py-2 text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="5th-grade">5th Grade (Easiest)</option>
                <option value="8th-grade">8th Grade (Intermediate)</option>
                <option value="Summary">Short Summary</option>
                <option value="Bullet Points">Bullet Points</option>
              </select>
            </div>

            <Button 
              onClick={handleRetranslate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
            >
              Start Translation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
