"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type BookRequest, type Room } from "../_consts";

export function useDashboardData(roomId: string, session: any, status: string) {
    const router = useRouter();
    const [requests, setRequests] = useState<BookRequest[]>([]);
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
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
    }, [roomId]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetchData();
        }
    }, [session, roomId, fetchData]);

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
                await fetchData();
                return { success: true };
            } else {
                const data = await res.json();
                return { success: false, error: data.error || "更新に失敗しました" };
            }
        } catch {
            return { success: false, error: "エラーが発生しました" };
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

    return {
        requests,
        room,
        isLoading,
        error,
        updatingId,
        updateStatus,
        sendReminder,
        copyToken,
    };
}
