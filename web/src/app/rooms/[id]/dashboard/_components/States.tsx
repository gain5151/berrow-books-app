export function LoadingView() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">読み込み中...</p>
        </div>
    );
}

export function EmptyState() {
    return (
        <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
                申請はまだありません。
            </p>
        </div>
    );
}
