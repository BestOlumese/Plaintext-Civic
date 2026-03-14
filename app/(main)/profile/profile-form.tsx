"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, LogOut } from "lucide-react";

export function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    preferredLanguage: user.preferredLanguage || "English",
    defaultReadingLevel: user.defaultReadingLevel || "5th-grade",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use Better Auth client to update user
      await authClient.updateUser({
        name: formData.name,
      });

      // Update the custom fields via our server action/API
      // Note: we can just update the database using a simple fetch if we had an endpoint, 
      // but since we don't have a dedicated update profile endpoint yet, we'll build a quick one or send it via auth client hooks if configured.
      // For now, let's assume `updateUser` from authClient handles it or we make a direct call.
      const res = await fetch("/api/user/update-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredLanguage: formData.preferredLanguage,
          defaultReadingLevel: formData.defaultReadingLevel,
        })
      });

      if (!res.ok) throw new Error("Failed to save preferences");

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            value={user.email} 
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            disabled
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">Email addresses cannot be changed currently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <Label>Default Language</Label>
            <select 
              value={formData.preferredLanguage}
              onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all h-11"
            >
              <option value="English">English</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="French">Français (French)</option>
              <option value="Mandarin">中文 (Mandarin)</option>
              <option value="Tagalog">Tagalog</option>
              <option value="Arabic">العربية (Arabic)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Default Complexity Level</Label>
            <select 
              value={formData.defaultReadingLevel}
              onChange={(e) => setFormData({ ...formData, defaultReadingLevel: e.target.value })}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all h-11"
            >
              <option value="5th-grade">5th Grade (Easiest)</option>
              <option value="8th-grade">8th Grade (Intermediate)</option>
              <option value="Summary">Short Summary</option>
              <option value="Bullet Points">Bullet Points</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Preferences
        </Button>
      </form>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full h-11 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300 border-0"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out of PlainText Civic
        </Button>
      </div>
    </div>
  );
}
