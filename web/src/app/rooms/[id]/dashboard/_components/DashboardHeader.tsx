import Link from "next/link";
import { type Room } from "../_consts";

type DashboardHeaderProps = {
    room: Room | null;
    roomId: string;
    onCopyToken: () => void;
};

export function DashboardHeader({ room, roomId, onCopyToken }: DashboardHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <Link
                    href="/rooms"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                >
                    ← ルーム一覧へ戻る
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                    {room?.name || "ダッシュボード"}
                </h1>
            </div>
            {room && (
                <div className="text-right">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        申請URL: /rooms/{roomId}/request
                    </p>
                    <button
                        onClick={onCopyToken}
                        className="mt-1 rounded bg-zinc-200 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                        トークンをコピー
                    </button>
                </div>
            )}
        </div>
    );
}
