"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faRss, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Article } from "@prisma/client";
import type { ApiResponse } from "@/app/_types/ApiResponse";

const ArticleDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/article/${params.id}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const data: ApiResponse<Article> = await res.json();
        if (data.success) {
          setArticle(data.payload);
          setReason("");
        } else {
          console.error(data.message);
          setReason(data.message);
        }
      } catch (e) {
        console.error("記事取得失敗", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-x-2">
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-gray-500"
          />
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>{reason}</p>
          <button
            onClick={() => router.push("/article")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            記事一覧に戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-x-2 text-blue-500 hover:text-blue-700 cursor-pointer"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        戻る
      </button>

      <article className="bg-white rounded-lg shadow-md p-6">
        <header className="mb-6 w-full">
          <h1 className="text-4xl font-bold mb-4 text-center">{article.title}</h1>
          <div className="flex justify-end gap-x-4 text-sm text-gray-600">
            <span>作成者: {article.user}</span>
            <span>公開日: {new Date(article.publishedAt).toLocaleDateString('ja-JP')}</span>
          </div>
        </header>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap">{article.content}</div>
        </div>
      </article>
    </main>
  );
};

export default ArticleDetailPage;