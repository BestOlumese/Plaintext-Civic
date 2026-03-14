"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Languages, BookOpen } from "lucide-react";

export function ClientDropzone() {
  const router = useRouter();
  
  // Local state for this specific upload
  const [useDefaults, setUseDefaults] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [readingLevel, setReadingLevel] = useState("5th-grade");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden transition-colors">
      
      {/* Upload Preferences Toolbar */}
      <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
        
        <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Use Profile Defaults</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Apply your saved language and complexity settings.</p>
          </div>
          <button 
            type="button"
            role="switch"
            aria-checked={useDefaults}
            onClick={() => setUseDefaults(!useDefaults)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${useDefaults ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <span 
              aria-hidden="true" 
              className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-all duration-200 ease-in-out" 
              style={{ transform: useDefaults ? 'translateX(20px)' : 'translateX(0px)' }} 
            />
          </button>
        </div>

        {!useDefaults && (
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" /> Target Language
              </label>
              <select 
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all ring-1 ring-slate-200 dark:ring-slate-800 shadow-xs"
              >
                <option value="English">English</option>
                <option value="Spanish">Español (Spanish)</option>
                <option value="French">Français (French)</option>
                <option value="Mandarin">中文 (Mandarin)</option>
                <option value="Tagalog">Tagalog</option>
                <option value="Arabic">العربية (Arabic)</option>
              </select>
            </div>

            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Complexity Level
              </label>
              <select 
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value)}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-0 rounded-xl px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all ring-1 ring-slate-200 dark:ring-slate-800 shadow-xs"
              >
                <option value="5th-grade">5th Grade (Easiest)</option>
                <option value="8th-grade">8th Grade (Intermediate)</option>
                <option value="Summary">Short Summary</option>
                <option value="Bullet Points">Bullet Points</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <UploadDropzone
        endpoint="documentUploader"
        onClientUploadComplete={async (res: any) => {
          if (res && res[0]) {
            const file = res[0];
            
            try {
              toast.loading("Reading document and running AI simplification...", { id: "simplify", duration: 100000 });
              
              const response = await fetch("/api/simplify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fileUrl: file.url,
                  fileName: file.name,
                  fileType: file.type || "application/pdf",
                  forceLanguage: useDefaults ? undefined : preferredLanguage,
                  forceReadingLevel: useDefaults ? undefined : readingLevel
                })
              });
              
              const data = await response.json();
              if (!response.ok) throw new Error(data.error || "Simplification failed");
              
              toast.success("Document successfully simplified!", { id: "simplify", duration: 4000 });
              
              // Redirect to the reading room 
              router.push(`/dashboard/document/${data.documentId}`);
              
            } catch (err: any) {
              toast.error(err.message || "Something went wrong.", { id: "simplify", duration: 4000 });
            }
          }
        }}
        onUploadError={(error: Error) => {
          toast.error(`Upload failed: ${error.message}`);
        }}
        config={{ mode: "auto" }}
        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer ut-label:text-blue-600 dark:ut-label:text-blue-400 ut-allowed-content:text-slate-500 dark:ut-allowed-content:text-slate-400 ut-button:bg-blue-600 ut-button:text-white ut-button:ut-readying:bg-blue-600/50 active:scale-[0.99] duration-200 ease-in-out"
      />
    </div>
  );
}
