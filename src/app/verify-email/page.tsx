// src/app/verify-email/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyCodeRequestSchema, VerifyCodeRequest } from "@/app/_types/EmailVerification";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import NextLink from "next/link";
import { useRouter } from "next/navigation"; // ← useSearchParamsを削除
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faEnvelope, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { ApiResponse } from "@/app/_types/ApiResponse";

const Page: React.FC = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const formMethods = useForm<VerifyCodeRequest>({
    mode: "onChange",
    resolver: zodResolver(verifyCodeRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    if (email) {
      formMethods.setValue("email", email);
    }
  }, [formMethods]);

  useEffect(() => {
    if (isVerified) {
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    }
  }, [isVerified, router]);

  const onSubmit = async (formValues: VerifyCodeRequest) => {
    try {
      setIsPending(true);
      setRootError("");

      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const result: ApiResponse<null> = await response.json();

      if (!result.success) {
        setRootError(result.message);
        return;
      }

      setIsVerified(true);
    } catch (error) {
      setRootError("認証中にエラーが発生しました。");
    } finally {
      setIsPending(false);
    }
  };

  const handleResendCode = async () => {
    const email = formMethods.getValues("email");
    if (!email) {
      setRootError("メールアドレスを入力してください。");
      return;
    }

    try {
      setIsResending(true);
      setRootError("");

      const response = await fetch("/api/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result: ApiResponse<null> = await response.json();
      setRootError(result.message);
    } catch (error) {
      setRootError("認証コードの再送信中にエラーが発生しました。");
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <main className="mx-4 max-w-md md:mx-auto">
        <div className="mt-8 text-center">
          <FontAwesomeIcon
            icon={faCheck}
            className="mb-4 text-4xl text-green-500"
          />
          <h1 className="mb-4 text-2xl font-bold text-green-600">
            認証完了！
          </h1>
          <p className="text-gray-600">
            メールアドレスの認証が完了しました。
            <br />
            ログイン画面に移動しています...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-4 max-w-md md:mx-auto">
      <div className="mt-8">
        <div className="mb-6 text-center">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="mb-4 text-4xl text-blue-500"
          />
          <h1 className="text-2xl font-bold">メール認証</h1>
          <p className="mt-2 text-gray-600">
            登録したメールアドレスに送信された認証コードを入力してください
          </p>
        </div>

        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block font-bold">
              メールアドレス
            </label>
            <TextInputField
              {...formMethods.register("email")}
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isPending}
              error={!!fieldErrors.email}
              autoComplete="email"
            />
            <ErrorMsgField msg={fieldErrors.email?.message} />
          </div>

          <div>
            <label htmlFor="code" className="mb-2 block font-bold">
              認証コード（6桁）
            </label>
            <TextInputField
              {...formMethods.register("code")}
              id="code"
              placeholder="123456"
              type="text"
              disabled={isPending}
              error={!!fieldErrors.code}
              autoComplete="off"
              maxLength={6}
            />
            <ErrorMsgField msg={fieldErrors.code?.message} />
          </div>

          <ErrorMsgField msg={fieldErrors.root?.message} />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                認証中...
              </>
            ) : (
              "認証する"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || isPending}
              className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
            >
              {isResending ? "送信中..." : "認証コードを再送信"}
            </button>
          </div>

          <div className="text-center">
            <NextLink
              href="/login"
              className="text-gray-500 hover:text-gray-700"
            >
              ← ログイン画面に戻る
            </NextLink>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Page;