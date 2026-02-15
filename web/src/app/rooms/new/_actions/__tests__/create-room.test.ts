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
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("crypto", () => ({
  randomBytes: vi.fn(() => ({
    toString: () => "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  })),
}));

// --- Imports (after mocks) ---

import { createRoom } from "../create-room";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetServerSession = vi.mocked(getServerSession);
const mockRoomCount = vi.mocked(prisma.room.count);
const mockRoomCreate = vi.mocked(prisma.room.create);

// --- Helpers ---

const futureDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
};

const validInput = () => ({
  name: "テストルーム",
  tokenExpiresAt: futureDate(),
});

// --- Tests ---

describe("createRoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. 未認証
  describe("認証チェック", () => {
    it("session が null の場合エラーを返す", async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await createRoom(validInput());

      expect(result).toEqual({ success: false, error: "認証されていません" });
      expect(mockRoomCount).not.toHaveBeenCalled();
    });

    it("session.user.id が無い場合エラーを返す", async () => {
      mockGetServerSession.mockResolvedValue({ user: {} } as never);

      const result = await createRoom(validInput());

      expect(result).toEqual({ success: false, error: "認証されていません" });
    });
  });

  // 2. バリデーション失敗
  describe("バリデーション", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
    });

    it("空の name でエラーを返す", async () => {
      const result = await createRoom({ name: "", tokenExpiresAt: futureDate() });

      expect(result).toEqual({
        success: false,
        error: "ルーム名を入力してください",
      });
    });

    it("過去の日付でエラーを返す", async () => {
      const result = await createRoom({
        name: "テスト",
        tokenExpiresAt: "2020-01-01T00:00:00.000Z",
      });

      expect(result).toEqual({
        success: false,
        error: "有効期限は現在より後の日時を設定してください",
      });
    });

    it("空の tokenExpiresAt でエラーを返す", async () => {
      const result = await createRoom({ name: "テスト", tokenExpiresAt: "" });

      expect(result).toEqual({
        success: false,
        error: "有効期限を設定してください",
      });
    });
  });

  // 3. ルーム上限超過
  describe("ルーム上限チェック", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
    });

    it("既に5件存在する場合エラーを返す", async () => {
      mockRoomCount.mockResolvedValue(5);

      const result = await createRoom(validInput());

      expect(result).toEqual({
        success: false,
        error: "ルームは最大5つまで作成できます",
      });
      expect(mockRoomCreate).not.toHaveBeenCalled();
    });
  });

  // 4. 正常作成
  describe("正常系", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
      mockRoomCount.mockResolvedValue(0);
      mockRoomCreate.mockResolvedValue(undefined as never);
    });

    it("prisma.room.create が正しい引数で呼ばれ success: true を返す", async () => {
      const input = validInput();
      const result = await createRoom(input);

      expect(result).toEqual({ success: true });
      expect(mockRoomCreate).toHaveBeenCalledWith({
        data: {
          name: input.name,
          token: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
          tokenExpiresAt: new Date(input.tokenExpiresAt),
          ownerId: "user-1",
        },
      });
    });
  });
});
