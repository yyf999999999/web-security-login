"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import Cookies from "js-cookie";
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
  // const [region, setRegion] = useState<Region>(Region.OSAKA);
  const [articles, setArticles] = useState<Article[]>([]);
  // const [regionDisplayName, setRegionDisplayName] = useState<string>("");
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

  // Cookie をセットする関数の定義
  /*const setSessionCookie = useCallback(() => {
    Cookies.set({
      expires: 7, // 有効期限（7日間）
      // path: "/api/news", // 💀 省略すると "/" が設定される
      // sameSite: "strict", // 💀 適切に設定しないとCSRF脆弱性が生じる
      secure: false, // 💀 本番環境(HTTPS)では true にすべき
    });
    // 👆 セキュアに利用する観点から各設定の意味を調べてみてください
  }, []);*/

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setName(params.get("name")); // 💀 サニタイズ（無害化）ぜずに値を格納
  }, []);

  // useEffect(() => {
  //   const regionStr = Cookies.get("region");
  //   // Cookieが存在しない もしくはデタラメな値の場合は OSAKA をセットする
  //   if (!regionStr || !Object.values(Region).includes(regionStr as Region)) {
  //     setSessionCookie(Region.OSAKA);
  //     return;
  //   }
  //   setRegion(regionStr as Region); // Cookieから取得した地域をセット
  // }, [setSessionCookie]);

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
  }, []); // regionの依存関係を削除

  //【💡SWRを利用した実装】
  // const fetcher = useCallback(async (endPoint: string) => {
  //   const res = await fetch(endPoint, {
  //     credentials: "same-origin",
  //     cache: "no-store",
  //   });
  //   return res.json();
  // }, []);

  // const { data: news, isLoading } = useSWR<ApiResponse<NewsItem[]>>(
  //   ep,
  //   fetcher,
  // );

  // useEffect(() => {
  //   if (news && news.success) setNewsItems(news.payload);
  // }, [news]);

  // useEffect(() => {
  //   mutate(ep); // 再検証(キャッシュ無効化して再取得)
  // }, [region]);

  /*useEffect(() => {
    setRegionDisplayName(regionDisplayNames[region]);
  }, [region]);

  // 地域の変更操作
  const changeRegion = async (newRegion: Region) => {
    if (region === newRegion) return;
    console.log("newRegion:", newRegion);
    setRegion(newRegion);
    // Cookieに保存（クライアントサイドで Cookie を直接操作）
    setSessionCookie(newRegion);
  };*/

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
          {/* サニタイズされていない値を dangerouslySetInnerHTML で出力（💀超危険） */}
          <span dangerouslySetInnerHTML={{ __html: name }} className="mr-1" />
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

      {/*<div className="mt-6 flex items-center gap-x-3">
        <div className="text-blue-500">
          <FontAwesomeIcon icon={faStreetView} className="mr-1" />
          地域を選択
        </div>
        <div>
          <select
            onChange={async (e) => await changeRegion(e.target.value as Region)}
            value={region}
            className="border-2 px-1"
          >
            {Object.values(Region).map((regionValue) => (
              <option key={regionValue} value={regionValue}>
                {regionDisplayNames[regionValue]} ({regionValue})
              </option>
            ))}
          </select>
        </div>
      </div>*/}

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