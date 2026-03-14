import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileType2, Plus, UploadCloud, Settings2 } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ClientDropzone } from "./client-dropzone";
import { DeleteDocumentButton } from "./delete-button";
import { decrypt } from "@/lib/encryption";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocumentGrid } from "./document-grid";
import { BarChart3, Clock, Zap } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      folder: true,
      simplifications: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          _count: {
            select: { glossaryTerms: true }
          }
        }
      }
    }
  });

  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" }
  });

  // Decrypt titles and calculate stats
  let totalWordsSimplified = 0;
  const decryptedDocs = documents.map(doc => {
    const latestSimp = doc.simplifications?.[0];
    if (latestSimp) {
      // Very rough word count estimation
      totalWordsSimplified += latestSimp.simplifiedText.split(/\s+/).length;
    }
    return {
      ...doc,
      decryptedTitle: decrypt(doc.title)
    };
  });

  const timeSavedMinutes = Math.round(totalWordsSimplified / 50); // Assumes 50 words per minute reading speed saved
  const jargonSimplified = documents.reduce((acc, doc) => acc + (doc.simplifications?.[0]?._count?.glossaryTerms || 0), 0);

  return (
    <div className="container mx-auto py-10 px-4 lg:px-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-row items-start sm:items-center justify-between w-full mb-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Documents</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg hidden sm:block">Upload and simplify complex paperwork instantly.</p>
          </div>
          <div className="shrink-0 ml-4 flex items-center gap-3">
            <ThemeToggle />
            <Link href="/profile">
              <Button variant="outline" className="gap-2 h-11 px-4 rounded-xl">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Profile & Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Usage Insights Widget */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-900/10 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Words Simplified</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalWordsSimplified.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-900/10 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reading Time Saved</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{timeSavedMinutes} mins</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jargon Filtered</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{jargonSimplified} terms</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Upload Area (Client Component wrapper for Sonner/Router hooks) */}
        <ClientDropzone />

        {/* Recent Documents Grid with Search & Folders */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Your Library</h2>
          </div>
          <DocumentGrid initialDocuments={decryptedDocs} folders={folders} />
        </div>

      </div>
    </div>
  );
}

