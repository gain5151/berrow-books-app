import { vi, describe, it, expect, beforeEach } from "vitest";

// --- Mocks ---

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    room: {
      findFirst: vi.fn(),
    },
    bookRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendShippedNotification: vi.fn(),
  sendReturnCompleteNotification: vi.fn(),
}));

// --- Imports (after mocks) ---

import { updateRequestStatus } from "../update-request-status";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  sendShippedNotification,
  sendReturnCompleteNotification,
} from "@/lib/email";

const mockGetServerSession = vi.mocked(getServerSession);
const mockRoomFindFirst = vi.mocked(prisma.room.findFirst);
const mockBookRequestFindUnique = vi.mocked(prisma.bookRequest.findUnique);
const mockBookRequestUpdate = vi.mocked(prisma.bookRequest.update);
const mockSendShippedNotification = vi.mocked(sendShippedNotification);
const mockSendReturnCompleteNotification = vi.mocked(
  sendReturnCompleteNotification
);

// --- Helpers ---

const mockExistingRequest = (overrides = {}) => ({
  id: "req-1",
  roomId: "room-1",
  title: "テスト本",
  status: "REQUESTED",
  requester: { email: "user@test.com" },
  ...overrides,
});

// --- Tests ---

describe("updateRequestStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. 未認証
  it("未認証の場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await updateRequestStatus("room-1", "req-1", "PURCHASED");

    expect(result).toEqual({ success: false, error: "認証されていません" });
  });

  // 2. 権限なし
  it("権限がない場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue(null);

    const result = await updateRequestStatus("room-1", "req-1", "PURCHASED");

    expect(result).toEqual({ success: false, error: "権限がありません" });
  });

  // 3. バリデーション失敗
  it("不正な status でエラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);

    const result = await updateRequestStatus("room-1", "req-1", "INVALID");

    expect(result.success).toBe(false);
  });

  // 4. 申請が見つからない
  it("申請が見つからない場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);
    mockBookRequestFindUnique.mockResolvedValue(null);

    const result = await updateRequestStatus("room-1", "req-1", "PURCHASED");

    expect(result).toEqual({ success: false, error: "申請が見つかりません" });
  });

  // 5. PURCHASED へ更新
  describe("ステータス更新", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
      mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);
    });

    it("PURCHASED へ更新すると purchasedAt が設定される", async () => {
      mockBookRequestFindUnique.mockResolvedValue(
        mockExistingRequest() as never
      );
      mockBookRequestUpdate.mockResolvedValue(
        mockExistingRequest({ status: "PURCHASED" }) as never
      );

      const result = await updateRequestStatus("room-1", "req-1", "PURCHASED");

      expect(result).toEqual({ success: true });
      expect(mockBookRequestUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PURCHASED",
            purchasedAt: expect.any(Date),
          }),
        })
      );
      expect(mockSendShippedNotification).not.toHaveBeenCalled();
    });

    // 6. SENT へ更新
    it("SENT へ更新すると sentAt が設定され通知が送信される", async () => {
      mockBookRequestFindUnique.mockResolvedValue(
        mockExistingRequest({ status: "PURCHASED" }) as never
      );
      const updatedReq = mockExistingRequest({
        status: "SENT",
        returnDueDate: null,
      });
      mockBookRequestUpdate.mockResolvedValue(updatedReq as never);

      const result = await updateRequestStatus("room-1", "req-1", "SENT");

      expect(result).toEqual({ success: true });
      expect(mockBookRequestUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "SENT",
            sentAt: expect.any(Date),
          }),
        })
      );
      expect(mockSendShippedNotification).toHaveBeenCalledWith({
        userEmail: "user@test.com",
        bookTitle: "テスト本",
        returnDueDate: undefined,
      });
    });

    // 7. RETURNED へ更新
    it("RETURNED へ更新すると returnedAt が設定され通知が送信される", async () => {
      mockBookRequestFindUnique.mockResolvedValue(
        mockExistingRequest({ status: "SENT" }) as never
      );
      mockBookRequestUpdate.mockResolvedValue(
        mockExistingRequest({ status: "RETURNED" }) as never
      );

      const result = await updateRequestStatus("room-1", "req-1", "RETURNED");

      expect(result).toEqual({ success: true });
      expect(mockBookRequestUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "RETURNED",
            returnedAt: expect.any(Date),
          }),
        })
      );
      expect(mockSendReturnCompleteNotification).toHaveBeenCalledWith({
        userEmail: "user@test.com",
        bookTitle: "テスト本",
      });
    });
  });
});
