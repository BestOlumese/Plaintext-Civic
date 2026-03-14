"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteDocumentButton({ 
  documentId,
  onDelete
}: { 
  documentId: string;
  onDelete?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this document?")) return;

    // Trigger optimistic update
    onDelete?.();

    setIsDeleting(true);
    toast.loading("Deleting document...", { id: `del-${documentId}` });

    try {
      const res = await fetch(`/api/document/${documentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success("Document deleted", { id: `del-${documentId}` });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message, { id: `del-${documentId}` });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 -mr-2"
      aria-label="Delete document"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
