"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type BookRequest = {
  id: string;
  title: string;
  status: "REQUESTED" | "PURCHASED" | "SENT" | "RETURNED";
  requestedAt: string;
  purchasedAt: string | null;
  sentAt: string | null;
  returnDueDate: string | null;
  returnedAt: string | null;
  requester: { email: string };
};

type Room = {
  id: string;
  name: string;
  token: string;
};

const STATUS_LABELS: Record<BookRequest["status"], string> = {
  REQUESTED: "申請中",
  PURCHASED: "購入済",
  SENT: "送付済",
  RETURNED: "返却完了",
};

const STATUS_COLORS: Record<BookRequest["status"], string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  PURCHASED: "bg-blue-100 text-blue-800",
  SENT: "bg-purple-100 text-purple-800",
  RETURNED: "bg-green-100 text-green-800",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [returnDueDate, setReturnDueDate] = useState("");
  const [showDateModal, setShowDateModal] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session, roomId]);

  const fetchData = async () => {
    try {
      const [requestsRes, roomsRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}/requests`),
        fetch("/api/rooms"),
      ]);

      if (requestsRes.ok) {
        setRequests(await requestsRes.json());
      } else {
        const data = await requestsRes.json();
        setError(data.error || "データの取得に失敗しました");
      }

      if (roomsRes.ok) {
        const rooms = await roomsRes.json();
        const currentRoom = rooms.find((r: Room) => r.id === roomId);
        setRoom(currentRoom || null);
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (
    requestId: string,
    newStatus: BookRequest["status"],
    returnDue?: string
  ) => {
    setUpdatingId(requestId);

    try {
      const body: { status: string; returnDueDate?: string } = { status: newStatus };
      if (returnDue) {
        body.returnDueDate = returnDue;
      }

      const res = await fetch(`/api/rooms/${roomId}/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchData();
        setShowDateModal(null);
        setReturnDueDate("");
      } else {
        const data = await res.json();
        alert(data.error || "更新に失敗しました");
      }
    } catch {
      alert("エラーが発生しました");
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReminder = async (requestId: string) => {
    if (!confirm("返却催促メールを送信しますか？")) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/requests/${requestId}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("リマインダーを送信しました");
      } else {
        const data = await res.json();
        alert(data.error || "送信に失敗しました");
      }
    } catch {
      alert("エラーが発生しました");
    }
  };

  const copyToken = () => {
    if (room?.token) {
      navigator.clipboard.writeText(room.token);
      alert("トークンをコピーしました");
    }
  };

  const getNextStatus = (current: BookRequest["status"]): BookRequest["status"] | null => {
    switch (current) {
      case "REQUESTED":
        return "PURCHASED";
      case "PURCHASED":
        return "SENT";
      case "SENT":
        return "RETURNED";
      default:
        return null;
    }
  };

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
      <div className="mx-auto max-w-6xl">
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
                onClick={copyToken}
                className="mt-1 rounded bg-zinc-200 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
              >
                トークンをコピー
              </button>
            </div>
          )}
        </div>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        {requests.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-zinc-800">
            <p className="text-zinc-600 dark:text-zinc-400">
              申請はまだありません。
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                    書籍タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                    申請者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                    返却期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {requests.map((req) => {
                  const nextStatus = getNextStatus(req.status);
                  const isOverdue =
                    req.returnDueDate &&
                    new Date(req.returnDueDate) < new Date() &&
                    req.status === "SENT";

                  return (
                    <tr key={req.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900 dark:text-white">
                        {req.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {req.requester.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${STATUS_COLORS[req.status]}`}
                        >
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {req.returnDueDate ? (
                          <span className={isOverdue ? "text-red-500 font-semibold" : "text-zinc-500 dark:text-zinc-400"}>
                            {new Date(req.returnDueDate).toLocaleDateString("ja-JP")}
                            {isOverdue && " (期限超過)"}
                          </span>
                        ) : (
                          <span className="text-zinc-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {nextStatus && (
                            <>
                              {nextStatus === "SENT" ? (
                                <button
                                  onClick={() => setShowDateModal(req.id)}
                                  disabled={updatingId === req.id}
                                  className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                  送付済にする
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateStatus(req.id, nextStatus)}
                                  disabled={updatingId === req.id}
                                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {STATUS_LABELS[nextStatus]}にする
                                </button>
                              )}
                            </>
                          )}
                          {req.status === "SENT" && req.returnDueDate && (
                            <button
                              onClick={() => sendReminder(req.id)}
                              className="rounded bg-orange-600 px-3 py-1 text-white hover:bg-orange-700"
                            >
                              催促
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Return Due Date Modal */}
        {showDateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-800">
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                返却期限を設定
              </h3>
              <input
                type="date"
                value={returnDueDate}
                onChange={(e) => setReturnDueDate(e.target.value)}
                className="mb-4 w-full rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowDateModal(null);
                    setReturnDueDate("");
                  }}
                  className="rounded-md bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-600 dark:text-zinc-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => updateStatus(showDateModal, "SENT", returnDueDate)}
                  disabled={!returnDueDate || updatingId === showDateModal}
                  className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  送付済にする
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
