"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { OTPInput } from "@/components/ui/otp-input";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "Verification code must be 6 digits"),
});

import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onSendOTP(values: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      });

      if (error) {
        toast.error(error.message || "Failed to send OTP. Please try again.");
      } else {
        setEmail(values.email);
        setStep("otp");
        toast.success("Verification code sent to your email!");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerifyOTP(values: z.infer<typeof otpSchema>) {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp: values.otp,
      });

      if (error) {
        toast.error(error.message || "Invalid or expired OTP.");
      } else {
        toast.success("Successfully signed in!");
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-slate-200 shadow-2xl shadow-slate-200/60 transition-all duration-500">
      <CardContent className="p-8">
        {step === "email" ? (
          <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold tracking-tight text-slate-700">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  {...emailForm.register("email")}
                  placeholder="name@example.com"
                  className="pl-10 h-11"
                  error={emailForm.formState.errors.email?.message}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" isLoading={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Code"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-sm text-slate-500 leading-relaxed">
                Enter the 6-digit code we sent to <br />
                <span className="font-bold text-slate-900 underline decoration-blue-500/30">{email}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <OTPInput
                value={otpForm.watch("otp") || ""}
                onChange={(val) => {
                  otpForm.setValue("otp", val);
                  if (val.length === 6) otpForm.handleSubmit(onVerifyOTP)();
                }}
                disabled={isLoading}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-center text-xs font-medium text-red-500">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full h-11 font-semibold" isLoading={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </Button>
              
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  otpForm.reset();
                }}
                className="w-full flex items-center justify-center text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest gap-2"
                disabled={isLoading}
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
