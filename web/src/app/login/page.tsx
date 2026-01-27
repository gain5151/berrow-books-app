"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateForm = (): LoginFormData | null => {
    const result = loginSchema.safeParse({ email });
    if (!result.success) {
      const firstError = result.error.issues[0];
      setValidationError(firstError.message);
      return null;
    }
    setValidationError("");
    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validatedData = validateForm();
    if (!validatedData) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email: validatedData.email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("メールの送信に失敗しました。もう一度お試しください。");
      } else {
        setIsSent(true);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
          <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            メールを確認してください
          </h1>
          <p className="text-center text-zinc-600 dark:text-zinc-400">
            {email} にログインリンクを送信しました。
            <br />
            メールを確認してリンクをクリックしてください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
          Berrow Books
        </h1>
        <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
          メールアドレスでログイン
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white ${
                validationError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600"
              }`}
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-500">{validationError}</p>
            )}
          </div>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "送信中..." : "ログインリンクを送信"}
          </button>
        </form>
      </div>
    </div>
  );
}
