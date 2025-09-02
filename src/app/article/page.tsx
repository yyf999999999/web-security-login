"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSquareRss,
  faRss,
  faStreetView,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/app/_hooks/useAuth";

import { Article, Role } from "@prisma/client";
import type { ApiResponse } from "@/app/_types/ApiResponse";

const Page: React.FC = () => {
  const ep = "/api/article";
  const [articles, setArticles] = useState<Article[]>([]);
  const [name, setName] = useState<string | null>(null);

  const { userProfile } = useAuth();
  const isLoggedIn = !!userProfile;
  const userRole = userProfile?.role || null;

  const getUserPermissionLevel = () => {
    if (!isLoggedIn) return 0; // 未ログイン: 公開記事(permission: 0)のみ
    if (userRole === Role.USER) return 1; // 一般ユーザー: permission 1まで表示可能
    if (userRole === Role.ADMIN) return 2;  // 管理者: 全記事表示可能
    return 0; // その他: 公開記事のみ
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawName = params.get("name");
    
    // サニタイズ処理を追加
    if (rawName) {
      // HTMLタグを除去して安全な文字列のみを使用
      const sanitizedName = rawName.replace(/<[^>]*>/g, '').slice(0, 50);
      setName(sanitizedName);
    }
  }, []);

  // 初回 のタイミングでニュース記事を取得【基本的な実装】
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(ep, {
          method: "GET",
          credentials: "include", // Cookieも送信
          cache: "no-store",
        });
        const data: ApiResponse<Article[]> = await res.json();
        if (data.success) {
          setArticles(data.payload);
        } else {
          console.error(data.message);
        }
      } catch (e) {
        console.error("記事取得失敗", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // データの取得中の画面出力
  if (isLoading) {
    return (
      <main>
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faSquareRss} className="mr-1.5" />
          Articles
        </div>
        <div className="mt-4 flex items-center gap-x-2">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-gray-500"
          />
          <div>Loading... </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faSquareRss} className="mr-1.5" />
        Articles
      </div>

      {name && (
        <div className="mt-4 ml-4 flex text-sm text-slate-600">
          <span className="mr-1">{name}</span>
          さん、こんにちは！
        </div>
      )}

      <div className="mt-4 ml-4 flex flex-col space-y-2">
        {articles.map((p) => {
          if (p.permission > getUserPermissionLevel()) return null;
          return (
          <Link href={`/article/${p.id}`} key={p.id}>
            <div className={twMerge("cursor-pointer hover:underline", p.permission==1 ? "text-indigo-500": (p.permission==2 ? "text-red-500" : ""))}>
              <FontAwesomeIcon icon={faRss} className="mr-2 text-slate-600" />
              {p.title} <span className="text-slate-600">- {p.user}</span>
            </div>
          </Link>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <p>
          ※ デベロッパーツール (F12)
          を起動して「アプリケーション」から「ストレージ」の「Cookie」を確認してください。
        </p>
        <p>※ このコンテンツは、ログインの有無に関係なく機能します。</p>
        <p className="text-rose-500">
          ※
          このコンテンツには、クロスサイトスクリプティング（XSS）が成立し得る深刻な脆弱性が含まれています。
        </p>
      </div>
    </main>
  );
};

export default Page;