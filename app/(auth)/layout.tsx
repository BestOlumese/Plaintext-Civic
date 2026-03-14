export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-[520px] py-12">
        {children}
      </div>
    </div>
  );
}
