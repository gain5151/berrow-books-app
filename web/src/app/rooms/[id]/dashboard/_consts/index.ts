import { z } from "zod";

export const BookRequestStatus = {
    REQUESTED: "REQUESTED",
    PURCHASED: "PURCHASED",
    SENT: "SENT",
    RETURNED: "RETURNED",
} as const;

export type BookRequestStatusType = typeof BookRequestStatus[keyof typeof BookRequestStatus];

export type BookRequest = {
    id: string;
    title: string;
    status: BookRequestStatusType;
    requestedAt: string;
    purchasedAt: string | null;
    sentAt: string | null;
    returnDueDate: string | null;
    returnedAt: string | null;
    requester: { email: string };
};

export type Room = {
    id: string;
    name: string;
    token: string;
};

export const STATUS_LABELS: Record<BookRequestStatusType, string> = {
    [BookRequestStatus.REQUESTED]: "申請中",
    [BookRequestStatus.PURCHASED]: "購入済",
    [BookRequestStatus.SENT]: "送付済",
    [BookRequestStatus.RETURNED]: "返却完了",
};

export const STATUS_COLORS: Record<BookRequestStatusType, string> = {
    [BookRequestStatus.REQUESTED]: "bg-yellow-100 text-yellow-800",
    [BookRequestStatus.PURCHASED]: "bg-blue-100 text-blue-800",
    [BookRequestStatus.SENT]: "bg-purple-100 text-purple-800",
    [BookRequestStatus.RETURNED]: "bg-green-100 text-green-800",
};

export const returnDateSchema = z.object({
    returnDueDate: z
        .string()
        .min(1, "返却期限を設定してください"),
});

export type ReturnDateFormData = z.infer<typeof returnDateSchema>;
