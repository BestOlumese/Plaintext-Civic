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

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      simplifications: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return (
    <div className="container mx-auto py-10 px-4 lg:px-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-row items-start sm:items-center justify-between w-full mb-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Documents</h1>
            <p className="text-slate-500 mt-1 text-lg hidden sm:block">Upload and simplify complex paperwork instantly.</p>
          </div>
          <div className="shrink-0 ml-4">
            <Link href="/profile">
              <Button variant="outline" className="gap-2 h-11 px-4 rounded-xl">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Profile & Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Upload Area (Client Component wrapper for Sonner/Router hooks) */}
        <ClientDropzone />

        {/* Recent Documents Grid */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Recent Translations</h2>
          {documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
              <p className="text-slate-500">You haven't translated any documents yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc: any) => {
                const latestSimp = doc.simplifications?.[0];
                return (
                  <Card key={doc.id} className="overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 group border-slate-200">
                    <CardHeader className="p-5 pb-4 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                            {latestSimp?.targetLanguage || "English"}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <DeleteDocumentButton documentId={doc.id} />
                      </div>
                      <CardTitle className="text-base font-semibold leading-tight group-hover:text-blue-600 transition-colors truncate pr-8">
                        {decrypt(doc.title)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
                        <FileType2 className="h-4 w-4 text-slate-400" />
                        <span>Level: <strong className="text-slate-700 font-medium">{latestSimp?.readingLevel || "Original"}</strong></span>
                      </div>
                      <Link href={`/dashboard/document/${doc.id}`} className="block">
                        <Button variant="secondary" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                          View Simplification
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

