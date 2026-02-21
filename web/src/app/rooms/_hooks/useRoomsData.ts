"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { catchTrouble } from "@/lib/wrappClient/CatchTrouble";
import { type Room } from "../_consts";
import { fetchRooms } from "../_actions/fetch-rooms";
import { addAdmin } from "../_actions/add-admin";
import { removeAdmin } from "../_actions/remove-admin";

export function useRoomsData(session: any, status: string) {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [addingAdmin, setAddingAdmin] = useState(false);
    const [adminError, setAdminError] = useState("");

    const _fetchRooms = useCallback(async () => {
        const result = await catchTrouble(async () => {
            return await fetchRooms();
        });

        if (!result) {
            setError("エラーが発生しました");
            setIsLoading(false);
            return;
        }

        if (result.success) {
            setRooms(result.rooms);
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            _fetchRooms();
        }
    }, [session, _fetchRooms]);

    const handleAddAdmin = async (email: string) => {
        if (!selectedRoom) return { success: false, error: "ルームが選択されていません" };

        setAddingAdmin(true);
        setAdminError("");

        const result = await catchTrouble(async () => {
            return await addAdmin(selectedRoom.id, email);
        });

        if (!result) {
            const msg = "エラーが発生しました";
            setAdminError(msg);
            setAddingAdmin(false);
            return { success: false, error: msg };
        }

        if (result.success) {
            setSelectedRoom(null);
            await _fetchRooms();
            setAddingAdmin(false);
            return { success: true };
        } else {
            setAdminError(result.error);
            setAddingAdmin(false);
            return { success: false, error: result.error };
        }
    };

    const handleRemoveAdmin = async (roomId: string, adminId: string) => {
        if (!confirm("この管理者を削除しますか？")) return;

        const result = await catchTrouble(async () => {
            return await removeAdmin(roomId, adminId);
        });

        if (!result || !result.success) {
            alert("削除に失敗しました");
            return;
        }

        await _fetchRooms();
    };

    return {
        rooms,
        isLoading,
        error,
        selectedRoom,
        setSelectedRoom,
        addingAdmin,
        adminError,
        setAdminError,
        handleAddAdmin,
        handleRemoveAdmin,
    };
}
