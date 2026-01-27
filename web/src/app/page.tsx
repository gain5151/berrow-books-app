"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
          Berrow Books
        </h1>
        <p className="mb-4 text-center text-zinc-600 dark:text-zinc-400">
          ようこそ、{session.user?.email} さん
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
