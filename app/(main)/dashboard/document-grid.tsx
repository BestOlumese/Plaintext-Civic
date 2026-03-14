"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileType2, 
  Search, 
  Plus, 
  Folder, 
  FolderPlus, 
  MoreVertical, 
  FolderInput, 
  Tag, 
  X,
  Filter
} from "lucide-react";
import Link from "next/link";
import { DeleteDocumentButton } from "./delete-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function DocumentGrid({ 
  initialDocuments, 
  folders 
}: { 
  initialDocuments: any[], 
  folders: any[] 
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [localFolders, setLocalFolders] = useState(folders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const router = useRouter();

  // Sync with initialDocuments and folders if they change from parent
  useMemo(() => {
    setDocuments(initialDocuments);
    setLocalFolders(folders);
  }, [initialDocuments, folders]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const titleToSearch = doc.decryptedTitle || doc.title || "";
      const matchesSearch = titleToSearch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = activeFolderId === null || doc.folderId === activeFolderId;
      return matchesSearch && matchesFolder;
    });
  }, [documents, searchQuery, activeFolderId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderName = newFolderName.trim();
    const tempId = `temp-${Date.now()}`;
    const previousFolders = [...localFolders];
    
    // 1. Optimistic Update
    setLocalFolders(current => [...current, { id: tempId, name: folderName }]);
    setNewFolderName("");
    setIsCreatingFolder(false);

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        body: JSON.stringify({ name: folderName }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      toast.success("Folder created");
      router.refresh();
    } catch (error) {
      // 2. Rollback
      setLocalFolders(previousFolders);
      setNewFolderName(folderName);
      setIsCreatingFolder(true);
      toast.error("Could not create folder");
    }
  };

  const handleMoveToFolder = async (docId: string, folderId: string | null) => {
    // 1. Optimistic Update
    const previousDocuments = [...documents];
    const targetFolder = localFolders.find(f => f.id === folderId);
    
    setDocuments(current => current.map(doc => 
      doc.id === docId ? { ...doc, folderId, folder: targetFolder || null } : doc
    ));

    try {
      const res = await fetch(`/api/documents/${docId}/folder`, {
        method: "PATCH",
        body: JSON.stringify({ folderId }),
      });

      if (!res.ok) throw new Error("Failed to move document");

      toast.success(folderId ? "Moved to folder" : "Removed from folder");
      // Keep state as is, but trigger refresh to sync server data
      router.refresh();
    } catch (error) {
      // 2. Rollback on failure
      setDocuments(previousDocuments);
      toast.error("Could not move document");
    }
  };

  const handleDeleteOptimistic = (docId: string) => {
    setDocuments(current => current.filter(doc => doc.id !== docId));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input
            placeholder="Search documents by title..."
            className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={activeFolderId === null ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveFolderId(null)}
            className="rounded-full px-4"
          >
            All
          </Button>
          {localFolders.map((folder) => (
            <Button
              key={folder.id}
              variant={activeFolderId === folder.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveFolderId(folder.id)}
              className="rounded-full px-4 whitespace-nowrap"
            >
              <Folder className="h-4 w-4 mr-2" />
              {folder.name}
            </Button>
          ))}
          <Button
             variant="ghost"
             size="sm"
             onClick={() => setIsCreatingFolder(true)}
             className="rounded-full px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {isCreatingFolder && (
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-4 flex gap-3">
            <Input
              autoFocus
              placeholder="Folder name..."
              className="h-10 bg-white"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button size="sm" onClick={handleCreateFolder}>Create</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsCreatingFolder(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
            <div className="bg-slate-100 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">No documents found matching your criteria.</p>
          </div>
        ) : (
          filteredDocuments.map((doc: any) => {
            const latestSimp = doc.simplifications?.[0];
            return (
              <Card key={doc.id} className="overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 group border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
                <CardHeader className="p-5 pb-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        {latestSimp?.targetLanguage || "English"}
                      </span>
                      {doc.folder && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                          <Folder className="h-3 w-3" />
                          {doc.folder.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage Document</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-bold px-2 py-1">Move to Folder</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleMoveToFolder(doc.id, null)} className="flex items-center gap-2">
                             <X className="h-4 w-4" />
                             No Folder
                          </DropdownMenuItem>
                          {localFolders.map((f: any) => (
                            <DropdownMenuItem key={f.id} onClick={() => handleMoveToFolder(doc.id, f.id)} className="flex items-center gap-2">
                               <Folder className="h-4 w-4" />
                               {f.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DeleteDocumentButton documentId={doc.id} onDelete={() => handleDeleteOptimistic(doc.id)} />
                    </div>
                  </div>
                  <CardTitle className="text-base font-semibold leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pr-4 text-slate-900 dark:text-slate-100 line-clamp-1">
                    {doc.decryptedTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                      <FileType2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <span>Reading level: <strong className="text-slate-700 dark:text-slate-300 font-bold">{latestSimp?.readingLevel || "Original"}</strong></span>
                  </div>
                  <Link href={`/dashboard/document/${doc.id}`} className="block">
                    <Button variant="secondary" className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium h-10 rounded-lg group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-all">
                      View Simplification
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
