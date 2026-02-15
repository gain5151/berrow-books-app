"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { catchTrouble } from "@/lib/wrappClient/CatchTrouble";
import { type BookRequest, type Room } from "../_consts";
import { fetchDashboardData } from "../_actions/fetch-dashboard-data";
import { updateRequestStatus } from "../_actions/update-request-status";
import { sendReminder } from "../_actions/send-reminder";

export function useDashboardData(roomId: string, session: any, status: string) {
    const router = useRouter();
    const [requests, setRequests] = useState<BookRequest[]>([]);
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const _fetchData = useCallback(async () => {
        const result = await catchTrouble(async () => {
            return await fetchDashboardData(roomId);
        });

        if (!result) {
            setError("エラーが発生しました");
            setIsLoading(false);
            return;
        }

        if (result.success) {
            setRequests(result.requests);
            setRoom(result.room);
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    }, [roomId]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (session?.user) {
            _fetchData();
        }
    }, [session, roomId, _fetchData]);

    const _executeUpdateStatus = async (
        requestId: string,
        newStatus: BookRequest["status"],
        returnDue?: string
    ) => {
        return await catchTrouble(async () => {
            return await updateRequestStatus(roomId, requestId, newStatus, returnDue);
        });
    };

    const handleUpdateStatus = async (
        requestId: string,
        newStatus: BookRequest["status"],
        returnDue?: string
    ) => {
        setUpdatingId(requestId);

        const result = await _executeUpdateStatus(requestId, newStatus, returnDue);

        if (!result) {
            setUpdatingId(null);
            return { success: false, error: "エラーが発生しました" };
        }

        if (result.success) {
            await _fetchData();
        }

        setUpdatingId(null);
        return result;
    };

    const _executeSendReminder = async (requestId: string) => {
        return await catchTrouble(async () => {
            return await sendReminder(roomId, requestId);
        });
    };

    const handleSendReminder = async (requestId: string) => {
        if (!confirm("返却催促メールを送信しますか？")) return;

        const result = await _executeSendReminder(requestId);

        if (!result) {
            alert("エラーが発生しました");
            return;
        }

        if (result.success) {
            alert("リマインダーを送信しました");
        } else {
            alert(result.error);
        }
    };

    const handleCopyToken = () => {
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
        updateStatus: handleUpdateStatus,
        sendReminder: handleSendReminder,
        copyToken: handleCopyToken,
    };
}
