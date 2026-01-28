"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import Link from "next/link";

const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "ルーム名を入力してください")
    .max(100, "ルーム名は100文字以内で入力してください"),
  tokenExpiresAt: z
    .string()
    .min(1, "有効期限を設定してください")
    .refine((val) => {
      const date = new Date(val);
      return date > new Date();
    }, "有効期限は現在より後の日時を設定してください"),
});

export default function NewRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; tokenExpiresAt?: string }>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Set default expiry to 30 days from now
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setTokenExpiresAt(defaultDate.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    const result = createRoomSchema.safeParse({ name, tokenExpiresAt });

    if (!result.success) {
      const fieldErrors: { name?: string; tokenExpiresAt?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (res.ok) {
        router.push("/rooms");
      } else {
        const data = await res.json();
        setSubmitError(data.error || "ルームの作成に失敗しました");
      }
    } catch {
      setSubmitError("エラーが発生しました");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <Link
            href="/rooms"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← ルーム一覧へ戻る
          </Link>
        </div>

        <div className="rounded-lg bg-white p-8 shadow dark:bg-zinc-800">
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
            新規ルーム作成
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            ※ 1ユーザーにつき最大5つまで作成できます
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                ルーム名
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 技術書レンタル"
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="tokenExpiresAt"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                管理用トークンの有効期限
              </label>
              <input
                type="datetime-local"
                id="tokenExpiresAt"
                value={tokenExpiresAt}
                onChange={(e) => setTokenExpiresAt(e.target.value)}
                className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white ${
                  errors.tokenExpiresAt
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600"
                }`}
              />
              {errors.tokenExpiresAt && (
                <p className="mt-1 text-sm text-red-500">{errors.tokenExpiresAt}</p>
              )}
            </div>

            {submitError && (
              <p className="mb-4 text-sm text-red-500">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "作成中..." : "ルームを作成"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
