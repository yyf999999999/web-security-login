import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { resendCodeRequestSchema } from "@/app/_types/EmailVerification";
import { generateVerificationCode, sendVerificationEmail } from "@/libs/emailService";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = resendCodeRequestSchema.safeParse(body);

    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "入力データが正しくありません。",
      };
      return NextResponse.json(res, { status: 400 });
    }

    const { email } = result.data;

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "このメールアドレスは登録されていません。",
      };
      return NextResponse.json(res, { status: 404 });
    }

    if (user.emailVerified) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "このメールアドレスは既に認証済みです。",
      };
      return NextResponse.json(res, { status: 400 });
    }

    // 既存の未使用コードを削除
    await prisma.verificationCode.deleteMany({
      where: { email },
    });

    // 新しい認証コードを生成・送信
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    await sendVerificationEmail(email, code);

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "認証コードを再送信しました。",
    };
    return NextResponse.json(res);
  } catch (error) {
    console.error("Resend code error:", error);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "認証コードの送信中にエラーが発生しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
}