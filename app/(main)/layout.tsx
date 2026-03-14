import { protectPage } from "@/lib/auth-utils";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectPage();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
