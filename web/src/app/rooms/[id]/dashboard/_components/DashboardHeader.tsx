import { BBAppLink } from "@/components/ui/BBAppLink";
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
                <BBAppLink
                    href="/rooms"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                >
                    ← ルーム一覧へ戻る
                </BBAppLink>
                <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                    {room?.name || "ダッシュボード"}
                </h1>
            </div>
            {room && (
                <div className="text-right">
                    <BBAppLink
                        href={`/rooms/${roomId}/request`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                        申請ページを開く
                    </BBAppLink>
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
