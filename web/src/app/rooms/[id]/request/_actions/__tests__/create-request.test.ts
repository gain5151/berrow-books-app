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
      findUnique: vi.fn(),
    },
    bookRequest: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendRequestNotification: vi.fn(),
}));

// --- Imports (after mocks) ---

import { createRequest } from "../create-request";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendRequestNotification } from "@/lib/email";

const mockGetServerSession = vi.mocked(getServerSession);
const mockRoomFindUnique = vi.mocked(prisma.room.findUnique);
const mockBookRequestCreate = vi.mocked(prisma.bookRequest.create);
const mockSendRequestNotification = vi.mocked(sendRequestNotification);

// --- Helpers ---

const futureDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
};

const mockRoom = (overrides = {}) => ({
  id: "room-1",
  name: "テストルーム",
  token: "valid-token",
  tokenExpiresAt: futureDate(),
  owner: { email: "owner@test.com" },
  ...overrides,
});

// --- Tests ---

describe("createRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. 未認証
  it("未認証の場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await createRequest("room-1", {
      title: "本",
      token: "abc",
    });

    expect(result).toEqual({ success: false, error: "認証されていません" });
  });

  // 2. バリデーション失敗
  describe("バリデーション", () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue({
        user: { id: "user-1" },
      } as never);
    });

    it("空タイトルでエラーを返す", async () => {
      const result = await createRequest("room-1", {
        title: "",
        token: "abc",
      });

      expect(result).toEqual({
        success: false,
        error: "書籍タイトルを入力してください",
      });
    });

    it("空トークンでエラーを返す", async () => {
      const result = await createRequest("room-1", {
        title: "本",
        token: "",
      });

      expect(result).toEqual({
        success: false,
        error: "トークンを入力してください",
      });
    });
  });

  // 3. ルーム未発見
  it("ルームが見つからない場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindUnique.mockResolvedValue(null);

    const result = await createRequest("room-1", {
      title: "本",
      token: "abc",
    });

    expect(result).toEqual({
      success: false,
      error: "ルームが見つかりません",
    });
  });

  // 4. トークン不一致
  it("トークンが一致しない場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindUnique.mockResolvedValue(mockRoom() as never);

    const result = await createRequest("room-1", {
      title: "本",
      token: "wrong-token",
    });

    expect(result).toEqual({ success: false, error: "トークンが無効です" });
  });

  // 5. トークン期限切れ
  it("トークンが期限切れの場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindUnique.mockResolvedValue(
      mockRoom({ tokenExpiresAt: new Date("2020-01-01") }) as never
    );

    const result = await createRequest("room-1", {
      title: "本",
      token: "valid-token",
    });

    expect(result).toEqual({
      success: false,
      error: "トークンの有効期限が切れています",
    });
  });

  // 6. 正常作成
  it("正常にリクエストを作成し通知を送信する", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindUnique.mockResolvedValue(mockRoom() as never);
    mockBookRequestCreate.mockResolvedValue({
      id: "req-1",
      title: "テスト本",
      requester: { email: "requester@test.com" },
    } as never);
    mockSendRequestNotification.mockResolvedValue(undefined as never);

    const result = await createRequest("room-1", {
      title: "テスト本",
      token: "valid-token",
    });

    expect(result).toEqual({ success: true });
    expect(mockBookRequestCreate).toHaveBeenCalledWith({
      data: {
        title: "テスト本",
        userId: "user-1",
        roomId: "room-1",
      },
      include: {
        requester: { select: { email: true } },
      },
    });
    expect(mockSendRequestNotification).toHaveBeenCalledWith({
      adminEmail: "owner@test.com",
      bookTitle: "テスト本",
      requesterEmail: "requester@test.com",
      roomName: "テストルーム",
    });
  });
});
