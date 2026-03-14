import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return notFound();
  }

  // Fetch complete user data including preferences
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 lg:px-8 max-w-3xl text-left">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-block mb-6">
          <Button variant="outline" className="gap-2 h-10 px-4 rounded-xl shadow-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Your Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Manage your account settings and translation preferences.</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800 pb-6 rounded-t-xl">
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal details and how documents are simplified by default.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ProfileForm user={user} />
        </CardContent>
      </Card>
      
    </div>
  );
}
