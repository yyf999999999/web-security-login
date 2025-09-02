import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { verifyCodeRequestSchema } from "@/app/_types/EmailVerification";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifyCodeRequestSchema.safeParse(body);

    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "入力データが正しくありません。",
      };
      return NextResponse.json(res, { status: 400 });
    }

    const { email, code } = result.data;

    // 認証コードの確認
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証コードが正しくないか、期限が切れています。",
      };
      return NextResponse.json(res, { status: 400 });
    }

    // ユーザーの認証状態を更新
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // 使用済み認証コードを削除
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "メールアドレスの認証が完了しました。",
    };
    return NextResponse.json(res);
  } catch (error) {
    console.error("Email verification error:", error);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "認証処理中にエラーが発生しました。",
    };
    return NextResponse.json(res, { status: 500 });
  }
}