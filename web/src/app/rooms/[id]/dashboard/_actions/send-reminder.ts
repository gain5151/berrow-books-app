"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnReminder } from "@/lib/email";

type SendReminderResult =
  | { success: true }
  | { success: false; error: string };

export async function sendReminder(
  roomId: string,
  requestId: string
): Promise<SendReminderResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証されていません" };
  }

  // Check if user is owner or admin
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      OR: [
        { ownerId: session.user.id },
        { admins: { some: { userId: session.user.id } } },
      ],
    },
  });

  if (!room) {
    return { success: false, error: "権限がありません" };
  }

  const bookRequest = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    include: { requester: { select: { email: true } } },
  });

  if (!bookRequest || bookRequest.roomId !== roomId) {
    return { success: false, error: "申請が見つかりません" };
  }

  if (!bookRequest.returnDueDate) {
    return { success: false, error: "返却期限が設定されていません" };
  }

  if (bookRequest.status === "RETURNED") {
    return { success: false, error: "既に返却済みです" };
  }

  await sendReturnReminder({
    userEmail: bookRequest.requester.email,
    bookTitle: bookRequest.title,
    returnDueDate: bookRequest.returnDueDate,
  });

  return { success: true };
}
