"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui";
import Link from "next/link";

const requestSchema = z.object({
  title: z
    .string()
    .min(1, "書籍タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  token: z.string().min(1, "トークンを入力してください"),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/rooms/${roomId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const result = await res.json();
        setSubmitError(result.error || "申請に失敗しました");
      }
    } catch {
      setSubmitError("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  if (!session) return null;

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
          <h1 className="mb-4 text-center text-2xl font-bold text-green-600">
            申請完了
          </h1>
          <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
            書籍の申請が完了しました。担当者からの連絡をお待ちください。
          </p>
          <Link
            href="/"
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
          >
            ホームへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← ホームへ戻る
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 shadow dark:bg-zinc-800">
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
            書籍申請
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <Input
                name="title"
                register={register}
                error={errors.title}
                label="書籍タイトル"
                type="text"
                placeholder="例: リーダブルコード"
              />
            </div>

            <div className="mb-6">
              <Input
                name="token"
                register={register}
                error={errors.token}
                label="アクセストークン"
                type="text"
                placeholder="管理者から共有されたトークン"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                ルーム管理者から共有されたトークンを入力してください
              </p>
            </div>

            {submitError && (
              <p className="mb-4 text-sm text-red-500">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "送信中..." : "申請する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
