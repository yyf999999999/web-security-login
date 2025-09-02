import { z } from "zod";

export const verifyCodeRequestSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  code: z.string().min(6, "認証コードは6桁です").max(6, "認証コードは6桁です"),
});

export const resendCodeRequestSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export type VerifyCodeRequest = z.infer<typeof verifyCodeRequestSchema>;
export type ResendCodeRequest = z.infer<typeof resendCodeRequestSchema>;