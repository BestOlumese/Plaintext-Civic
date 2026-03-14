import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export const GET = handler;

export const POST = async (req: Request) => {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // Limit auth POST requests (sign-in, otp, etc.) to 10 per 15 mins per IP
  const limiter = rateLimit(`auth_api:${ip}`, 10, 15 * 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many auth attempts. Please wait 15 minutes." },
      { status: 429 }
    );
  }

  return handler.POST(req);
};
