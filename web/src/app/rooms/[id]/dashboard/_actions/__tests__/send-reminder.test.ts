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
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendReturnReminder: vi.fn(),
}));

// --- Imports (after mocks) ---

import { sendReminder } from "../send-reminder";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { sendReturnReminder } from "@/lib/email";

const mockGetServerSession = vi.mocked(getServerSession);
const mockRoomFindFirst = vi.mocked(prisma.room.findFirst);
const mockBookRequestFindUnique = vi.mocked(prisma.bookRequest.findUnique);
const mockSendReturnReminder = vi.mocked(sendReturnReminder);

// --- Helpers ---

const mockRequest = (overrides = {}) => ({
  id: "req-1",
  roomId: "room-1",
  title: "テスト本",
  status: "SENT",
  returnDueDate: new Date("2026-03-01"),
  requester: { email: "user@test.com" },
  ...overrides,
});

// --- Tests ---

describe("sendReminder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. 未認証
  it("未認証の場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await sendReminder("room-1", "req-1");

    expect(result).toEqual({ success: false, error: "認証されていません" });
  });

  // 2. 権限なし
  it("権限がない場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue(null);

    const result = await sendReminder("room-1", "req-1");

    expect(result).toEqual({ success: false, error: "権限がありません" });
  });

  // 3. 申請が見つからない
  it("申請が見つからない場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);
    mockBookRequestFindUnique.mockResolvedValue(null);

    const result = await sendReminder("room-1", "req-1");

    expect(result).toEqual({ success: false, error: "申請が見つかりません" });
  });

  // 4. 返却期限未設定
  it("返却期限が未設定の場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);
    mockBookRequestFindUnique.mockResolvedValue(
      mockRequest({ returnDueDate: null }) as never
    );

    const result = await sendReminder("room-1", "req-1");

    expect(result).toEqual({
      success: false,
      error: "返却期限が設定されていません",
    });
  });

  // 5. 既に返却済み
  it("既に返却済みの場合エラーを返す", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);
    mockBookRequestFindUnique.mockResolvedValue(
      mockRequest({ status: "RETURNED" }) as never
    );

    const result = await sendReminder("room-1", "req-1");

    expect(result).toEqual({ success: false, error: "既に返却済みです" });
  });

  // 6. 正常送信
  it("正常にリマインダーを送信する", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    mockRoomFindFirst.mockResolvedValue({ id: "room-1" } as never);
    const request = mockRequest();
    mockBookRequestFindUnique.mockResolvedValue(request as never);
    mockSendReturnReminder.mockResolvedValue(undefined as never);

    const result = await sendReminder("room-1", "req-1");

    expect(result).toEqual({ success: true });
    expect(mockSendReturnReminder).toHaveBeenCalledWith({
      userEmail: "user@test.com",
      bookTitle: "テスト本",
      returnDueDate: request.returnDueDate,
    });
  });
});
