"use server";

import { prisma } from "@/libs/prisma";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";
import { generateVerificationCode, sendVerificationEmail } from "@/libs/emailService";
import bcrypt from "bcryptjs";

export const signupServerAction = async (
  signupRequest: SignupRequest,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    const payload = signupRequestSchema.parse(signupRequest);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return {
        success: false,
        payload: null,
        message: "このメールアドレスは既に使用されています。",
      };
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // ユーザー作成（未認証状態）
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
        emailVerified: false, // 未認証状態で作成
      },
    });

    // 認証コード生成・送信
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分後

    await prisma.verificationCode.create({
      data: {
        email: payload.email,
        code,
        expiresAt,
      },
    });

    await sendVerificationEmail(payload.email, code);

    const res: ServerActionResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "認証コードをメールに送信しました。",
    };
    return res;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    return {
      success: false,
      payload: null,
      message: "サインアップの処理に失敗しました。",
    };
  }
};