import Link from "next/link";

export function RoomsHeader() {
    return (
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                ルーム管理
            </h1>
            <div className="flex gap-4">
                <Link
                    href="/"
                    className="rounded-md bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                >
                    ホームへ
                </Link>
                <Link
                    href="/rooms/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    新規ルーム作成
                </Link>
            </div>
        </div>
    );
}
