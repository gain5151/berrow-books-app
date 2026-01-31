"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Room } from "../_consts";

export function useRoomsData(session: any, status: string) {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [adminEmail, setAdminEmail] = useState("");
    const [addingAdmin, setAddingAdmin] = useState(false);
    const [adminError, setAdminError] = useState("");

    const fetchRooms = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            fetchRooms();
        }
    }, [session, fetchRooms]);

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
                await fetchRooms();
                return { success: true };
            } else {
                const data = await res.json();
                const msg = data.error || "管理者の追加に失敗しました";
                setAdminError(msg);
                return { success: false, error: msg };
            }
        } catch {
            const msg = "エラーが発生しました";
            setAdminError(msg);
            return { success: false, error: msg };
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
                await fetchRooms();
            } else {
                alert("削除に失敗しました");
            }
        } catch {
            alert("エラーが発生しました");
        }
    };

    return {
        rooms,
        isLoading,
        error,
        selectedRoom,
        setSelectedRoom,
        adminEmail,
        setAdminEmail,
        addingAdmin,
        adminError,
        setAdminError,
        handleAddAdmin,
        handleRemoveAdmin,
    };
}
