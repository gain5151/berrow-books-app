import { type Room, isTokenExpired } from "../_consts";
import { BBAppButton, BBAppLink } from "@/components/ui";

type RoomCardProps = {
    room: Room;
    currentUserId: string;
    onAddAdmin: (room: Room) => void;
    onRemoveAdmin: (roomId: string, adminId: string) => void;
};

export function RoomCard({
    room,
    currentUserId,
    onAddAdmin,
    onRemoveAdmin,
}: RoomCardProps) {
    const expired = isTokenExpired(room.tokenExpiresAt);

    return (
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        {room.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        オーナー: {room.owner.email}
                        {room.ownerId === currentUserId && " (あなた)"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        リクエスト数: {room._count.requests}
                    </p>
                    <p
                        className={`mt-1 text-sm ${expired ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"
                            }`}
                    >
                        有効期限: {new Date(room.tokenExpiresAt).toLocaleString("ja-JP")}
                        {expired && " (期限切れ)"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <BBAppLink
                        href={`/rooms/${room.id}/dashboard`}
                    //className="bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                        ダッシュボード
                    </BBAppLink>
                    {room.ownerId === currentUserId && (
                        <BBAppButton
                            size="sm"
                            variant="ghost"
                            onClick={() => onAddAdmin(room)}
                        //className="bg-green-600 text-white hover:bg-green-700"
                        >
                            管理者を追加
                        </BBAppButton>
                    )}
                </div>
            </div>

            {room.admins.length > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        管理者:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {room.admins.map((admin) => (
                            <span
                                key={admin.id}
                                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                            >
                                {admin.user.email}
                                {room.ownerId === currentUserId && (
                                    <BBAppButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveAdmin(room.id, admin.id)}
                                        className="p-0 text-red-500 hover:bg-transparent hover:text-red-700"
                                    >
                                        ×
                                    </BBAppButton>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
