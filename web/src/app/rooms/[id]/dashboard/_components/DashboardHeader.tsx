import { BBAppLink } from "@/components/ui/BBAppLink";
import { BBAppButton } from "@/components/ui";
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
                    <BBAppButton
                        variant="secondary"
                        size="sm"
                        onClick={onCopyToken}
                        className="mt-1"
                    >
                        トークンをコピー
                    </BBAppButton>
                </div>
            )}
        </div>
    );
}
