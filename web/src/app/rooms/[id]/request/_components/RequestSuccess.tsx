import { BBAppLink } from "@/components/ui/BBAppLink";

export function RequestSuccess() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
                <h1 className="mb-4 text-center text-2xl font-bold text-green-600">
                    申請完了
                </h1>
                <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
                    書籍の申請が完了しました。担当者からの連絡をお待ちください。
                </p>
                <BBAppLink
                    href="/"
                    className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
                >
                    ホームへ戻る
                </BBAppLink>
            </div>
        </div>
    );
}
