import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { emailOTP, username } from "better-auth/plugins";
import { transporter } from "./mailer";import { otpEmailTemplate } from "./otpEmail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      onboarded: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      preferredLanguage: {
        type: "string",
        required: false,
      },
      defaultReadingLevel: {
        type: "string",
        required: false,
      },
    },
  },
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID as string,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  //   },
  // },
  plugins: [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await transporter.sendMail({
            from: `"Plaintext Civic" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your login otp code",
            html: otpEmailTemplate(otp),
          });
        }
      },
    }),
  ],
});
