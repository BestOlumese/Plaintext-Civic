"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Languages, AtSign, ArrowRight, List, AlignLeft, User } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username too long"),
  preferredLanguage: z.string().min(2, "Please select a language"),
  defaultReadingLevel: z.string().min(2, "Please select a reading level"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      username: "",
      preferredLanguage: "English",
      defaultReadingLevel: "5th-grade",
    },
  });

  async function onSubmit(values: OnboardingValues) {
    setIsLoading(true);
    try {
      const { error } = await authClient.updateUser({
        name: values.name,
        username: values.username,
        // @ts-ignore - these are additional fields
        preferredLanguage: values.preferredLanguage,
        defaultReadingLevel: values.defaultReadingLevel,
        onboarded: true,
      });

      if (error) {
        toast.error(error.message || "Failed to save profile.");
      } else {
        toast.success("Profile completed! Welcome to PlainText Civic.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-[0_20px_50px_rgba(8,112,184,0.07)] overflow-hidden">
      <div className="h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600" />
      <CardHeader className="p-10 pb-2">
        <CardTitle className="text-2xl font-bold">Reading Preferences</CardTitle>
        <CardDescription className="text-slate-500 text-base">
          Customize how documents are translated and simplified for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-10 pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  {...form.register("name")}
                  placeholder="Jane Smith"
                  className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all shadow-sm"
                  error={form.formState.errors.name?.message}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Choose a Username</label>
              <div className="relative group">
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  {...form.register("username")}
                  placeholder="janesmith"
                  className="pl-10 h-12 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all shadow-sm"
                  error={form.formState.errors.username?.message}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Reading Level Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold tracking-wider text-slate-400 uppercase">Default Complexity</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => form.setValue("defaultReadingLevel", "5th-grade")}
                className={`group flex flex-col items-start justify-between rounded-2xl border-2 p-5 transition-all duration-300 ${
                  form.watch("defaultReadingLevel") === "5th-grade"
                    ? "border-blue-600 bg-blue-50/40 text-blue-600 shadow-lg shadow-blue-100/50"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-500"
                }`}
              >
                <div className={`mb-3 rounded-xl p-2.5 transition-colors ${form.watch("defaultReadingLevel") === "5th-grade" ? "bg-blue-600 text-white" : "bg-slate-50 group-hover:bg-slate-100"}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold tracking-tight">5th Grade Level</span>
                  <span className="text-xs font-medium opacity-70">Simplest wording</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => form.setValue("defaultReadingLevel", "Summary")}
                className={`group flex flex-col items-start justify-between rounded-2xl border-2 p-5 transition-all duration-300 ${
                  form.watch("defaultReadingLevel") === "Summary"
                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-600 shadow-lg shadow-indigo-100/50"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-500"
                }`}
              >
                <div className={`mb-3 rounded-xl p-2.5 transition-colors ${form.watch("defaultReadingLevel") === "Summary" ? "bg-indigo-600 text-white" : "bg-slate-50 group-hover:bg-slate-100"}`}>
                  <AlignLeft className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold tracking-tight">Executive Summary</span>
                  <span className="text-xs font-medium opacity-70">Core meaning only</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => form.setValue("defaultReadingLevel", "Bullet Points")}
                className={`group flex flex-col items-start justify-between rounded-2xl border-2 p-5 transition-all duration-300 ${
                  form.watch("defaultReadingLevel") === "Bullet Points"
                    ? "border-blue-600 bg-blue-50/40 text-blue-600 shadow-lg shadow-blue-100/50"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-500"
                }`}
              >
                <div className={`mb-3 rounded-xl p-2.5 transition-colors ${form.watch("defaultReadingLevel") === "Bullet Points" ? "bg-blue-600 text-white" : "bg-slate-50 group-hover:bg-slate-100"}`}>
                  <List className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold tracking-tight">Bullet Points</span>
                  <span className="text-xs font-medium opacity-70">Skimmable facts</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => form.setValue("defaultReadingLevel", "High School")}
                className={`group flex flex-col items-start justify-between rounded-2xl border-2 p-5 transition-all duration-300 ${
                  form.watch("defaultReadingLevel") === "High School"
                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-600 shadow-lg shadow-indigo-100/50"
                    : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:text-slate-500"
                }`}
              >
                <div className={`mb-3 rounded-xl p-2.5 transition-colors ${form.watch("defaultReadingLevel") === "High School" ? "bg-indigo-600 text-white" : "bg-slate-50 group-hover:bg-slate-100"}`}>
                  <User className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold tracking-tight">High School</span>
                  <span className="text-xs font-medium opacity-70">Standard reading</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Primary Language</label>
            <div className="relative group">
              <Languages className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <select
                {...form.register("preferredLanguage")}
                className="flex h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/30 shadow-sm px-3 py-2 pl-10 text-sm ring-offset-white focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                disabled={isLoading}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Mandarin">Mandarin (中文)</option>
                <option value="Arabic">Arabic (العربية)</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all active:scale-[0.98]" isLoading={isLoading}>
              Save Preferences
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
