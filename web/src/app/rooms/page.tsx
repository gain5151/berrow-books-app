"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Room = {
  id: string;
  name: string;
  token: string;
  tokenExpiresAt: string;
  ownerId: string;
  createdAt: string;
  owner: { email: string };
  admins: { id: string; user: { email: string } }[];
  _count: { requests: number };
};

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchRooms();
    }
  }, [session]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      } else {
        setError("ルームの取得に失敗しました");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setAddingAdmin(true);
    setAdminError("");

    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail }),
      });

      if (res.ok) {
        setAdminEmail("");
        setSelectedRoom(null);
        fetchRooms();
      } else {
        const data = await res.json();
        setAdminError(data.error || "管理者の追加に失敗しました");
      }
    } catch {
      setAdminError("エラーが発生しました");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (roomId: string, adminId: string) => {
    if (!confirm("この管理者を削除しますか？")) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/admins?adminId=${adminId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchRooms();
      }
    } catch {
      alert("削除に失敗しました");
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">読み込み中...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl">
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

        {error && (
          <p className="mb-4 text-red-500">{error}</p>
        )}

        {rooms.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              ルームがありません。新規ルームを作成してください。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                      {room.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      オーナー: {room.owner.email}
                      {room.ownerId === session.user.id && " (あなた)"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      リクエスト数: {room._count.requests}
                    </p>
                    <p
                      className={`mt-1 text-sm ${
                        isExpired(room.tokenExpiresAt)
                          ? "text-red-500"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      有効期限: {new Date(room.tokenExpiresAt).toLocaleString("ja-JP")}
                      {isExpired(room.tokenExpiresAt) && " (期限切れ)"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/rooms/${room.id}/dashboard`}
                      className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      ダッシュボード
                    </Link>
                    {room.ownerId === session.user.id && (
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                      >
                        管理者を追加
                      </button>
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
                          {room.ownerId === session.user.id && (
                            <button
                              onClick={() => handleRemoveAdmin(room.id, admin.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Admin Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                管理者を追加 - {selectedRoom.name}
              </h3>
              <form onSubmit={handleAddAdmin}>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="メールアドレス"
                  className="mb-4 w-full rounded-md border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
                {adminError && (
                  <p className="mb-4 text-sm text-red-500">{adminError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      setAdminEmail("");
                      setAdminError("");
                    }}
                    className="rounded-md bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-600 dark:text-zinc-200"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {addingAdmin ? "追加中..." : "追加"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
