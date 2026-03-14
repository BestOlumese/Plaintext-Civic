import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, BookOpen, Languages, FileText, ArrowRight, Lightbulb } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">PlainText Civic</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="#impact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Social Impact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 mb-8">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Document Reader</span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 bg-linear-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent italic">
                Bureaucracy, Translated.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 lg:text-xl">
                Government documents, legal forms, and healthcare policies shouldn't require a law degree to understand. PlainText Civic uses AI to translate dense jargon into simple, accessible language.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="px-8 h-14 text-lg">
                    Simplify a Document
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="px-8 h-14 text-lg">
                    How it Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-0 -z-10 h-[400px] w-[400px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-100/30 blur-[100px]" />
          <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[400px] translate-y-1/2 translate-x-1/2 rounded-full bg-slate-200/30 blur-[100px]" />
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Platform Features</h2>
              <p className="mt-4 text-slate-600">Empowering you to understand your rights and access essential services.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "PDF & Image Upload",
                  desc: "Upload PDFs, legal forms, or take a picture of a physical document. We use OCR to extract the text instantly.",
                  icon: <FileText className="h-6 w-6 text-blue-600" />,
                },
                {
                  title: "Reading Level Toggle",
                  desc: "Adjust the complexity. Choose from 5th-grade levels, summaries, or quick bullet points based on your needs.",
                  icon: <BookOpen className="h-6 w-6 text-blue-600" />,
                },
                {
                  title: "AI Translation",
                  desc: "Translate documents natively. Perfect for immigrants navigating complex visa paperwork.",
                  icon: <Languages className="h-6 w-6 text-blue-600" />,
                },
                {
                  title: "Built-in Glossary",
                  desc: "Sometimes legal terms are unavoidable. We highlight jargon and provide simple pop-up definitions.",
                  icon: <Lightbulb className="h-6 w-6 text-blue-600" />,
                },
                {
                  title: "Secure & Private",
                  desc: "Your documents are processed securely and your data is never used to train our AI models.",
                  icon: <Shield className="h-6 w-6 text-blue-600" />,
                },
                {
                  title: "Designed for Accessibility",
                  desc: "A clean, high-contrast interface designed specifically for elderly citizens and those with low vision.",
                  icon: <BookOpen className="h-6 w-6 text-blue-600" />,
                }
              ].map((feature, i) => (
                <div key={i} className="group relative rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all group-hover:bg-blue-600 group-hover:text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-20 text-white">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6 sm:text-4xl">Access to clear information is a right.</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Break down the barrier of complex language. Empower yourself and your family to independently manage civic responsibilities.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 h-14 px-10 text-lg">
                Upload your first document
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                <Shield className="h-3 w-3" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Plaintext Civic</span>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Plaintext Civic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
