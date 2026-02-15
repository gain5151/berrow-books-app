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
      findMany: vi.fn(),
    },
  },
}));

// --- Imports (after mocks) ---

import { fetchDashboardData } from "../fetch-dashboard-data";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetServerSession = vi.mocked(getServerSession);
const mockRoomFindFirst = vi.mocked(prisma.room.findFirst);
const mockBookRequestFindMany = vi.mocked(prisma.bookRequest.findMany);

// --- Tests ---

describe("fetchDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. 未認証
  describe("認証チェック", () => {
    it("session が null の場合エラーを返す", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await fetchDashboardData("room-1");

      expect(result).toEqual({ success: false, error: "認証されていません" });
      expect(mockRoomFindFirst).not.toHaveBeenCalled();
    });

    it("session.user.id が無い場合エラーを返す", async () => {
      mockGetServerSession.mockResolvedValue({ user: {} } as never);

      const result = await fetchDashboardData("room-1");

      expect(result).toEqual({ success: false, error: "認証されていません" });
    });
  });

  // 2. 権限なし
  describe("権限チェック", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
    });

    it("ルーム未所有の場合エラーを返す", async () => {
      mockRoomFindFirst.mockResolvedValue(null);

      const result = await fetchDashboardData("room-1");

      expect(result).toEqual({ success: false, error: "権限がありません" });
      expect(mockBookRequestFindMany).not.toHaveBeenCalled();
    });
  });

  // 3. 正常取得
  describe("正常系", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
    });

    it("リクエスト一覧とルーム情報を返す", async () => {
      const mockRoom = { id: "room-1", name: "テストルーム", token: "abc123" };
      mockRoomFindFirst.mockResolvedValue(mockRoom as never);

      const mockRequests = [
        { id: "req-1", title: "本A", requester: { email: "a@test.com" } },
        { id: "req-2", title: "本B", requester: { email: "b@test.com" } },
      ];
      mockBookRequestFindMany.mockResolvedValue(mockRequests as never);

      const result = await fetchDashboardData("room-1");

      expect(result).toEqual({
        success: true,
        requests: mockRequests,
        room: { id: "room-1", name: "テストルーム", token: "abc123" },
      });
      expect(mockBookRequestFindMany).toHaveBeenCalledWith({
        where: { roomId: "room-1" },
        include: { requester: { select: { email: true } } },
        orderBy: { requestedAt: "desc" },
      });
    });
  });
});
