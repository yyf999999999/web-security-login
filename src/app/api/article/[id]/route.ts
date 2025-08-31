import { prisma } from "@/libs/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Article, Role } from "@prisma/client";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { cookies } from "next/headers";


// サーバーサイドで認証情報を取得する関数
const getAuthFromRequest = async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    
    if (!sessionId) {
      return { isLoggedIn: false, userRole: null };
    }

    // セッションからユーザー情報を取得
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return { isLoggedIn: false, userRole: null };
    }

    return {
      isLoggedIn: true,
      userRole: session.user.role as Role
    };
  } catch (error) {
    console.error("認証情報の取得に失敗:", error);
    return { isLoggedIn: false, userRole: null };
  }
};

// 権限レベルを計算する関数
const getUserPermissionLevel = (isLoggedIn: boolean, userRole: Role | null) => {
  if (!isLoggedIn) return 0; // 未ログイン: 公開記事のみ
  if (userRole === Role.USER) return 1; // 一般ユーザー: permission 1まで表示可能
  if (userRole === Role.ADMIN) return 2;  // 管理者: 全記事表示可能
  return 0; // その他: 公開記事のみ
};

export const GET = async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const params = await context.params;

    const { isLoggedIn, userRole } = await getAuthFromRequest();
    const userPermissionLevel = getUserPermissionLevel(isLoggedIn, userRole);

    const article: Article | null = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!article) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "記事が見つかりませんでした",
      };
      return NextResponse.json(res, { status: 404 });
    }

    const res: ApiResponse<Article> = {
      success: true,
      payload: article,
      message: "",
    };

    if (article.permission > userPermissionLevel) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "このコンテンツを表示する権限がありません",
      };
      return NextResponse.json(res, { status: 403 });
    }

    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error("Article Detail API Error:", errorMsg);
    
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "記事の取得に失敗しました",
    };
    return NextResponse.json(res, { status: 500 });
  }
};