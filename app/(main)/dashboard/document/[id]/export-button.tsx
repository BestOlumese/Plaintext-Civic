"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import generatePDF from "react-to-pdf";
import { toast } from "sonner";

export function ExportPdfButton({ targetRef, documentTitle }: { targetRef: React.RefObject<HTMLDivElement | null>, documentTitle: string }) {
  const handleExport = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-export" });
      
      const element = targetRef.current;
      if (!element) {
        throw new Error("Target element not found");
      }

      await generatePDF(() => element, {
        filename: `${documentTitle} - Simplified.pdf`,
        page: { margin: 20 }
      });
      toast.success("PDF exported successfully!", { id: "pdf-export" });
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      toast.error(`Export Failed: ${errorMessage}`, { id: "pdf-export", duration: 6000 });
      console.error("PDF Export Error:", error);
    }
  };

  return (
    <Button onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
