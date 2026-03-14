import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { protectPage } from "@/lib/auth-utils";

export default async function OnboardingPage() {
  // Allow onboarding flow, but redirect to dashboard if already onboarded
  await protectPage(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Let&apos;s get you set up</h1>
        <p className="text-slate-500 max-w-[320px] text-lg leading-relaxed">
          Join the conversation and start making an impact in your community.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
