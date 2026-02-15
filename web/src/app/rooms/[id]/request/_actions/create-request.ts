"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRequestSchema } from "@/lib/validations/request";
import { sendRequestNotification } from "@/lib/email";

type CreateRequestResult =
  | { success: true }
  | { success: false; error: string };

export async function createRequest(
  roomId: string,
  data: { title: string; token: string }
): Promise<CreateRequestResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証されていません" };
  }

  const result = createRequestSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  // Verify room and token
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: { select: { email: true } },
    },
  });

  if (!room) {
    return { success: false, error: "ルームが見つかりません" };
  }

  if (room.token !== result.data.token) {
    return { success: false, error: "トークンが無効です" };
  }

  if (new Date() > room.tokenExpiresAt) {
    return { success: false, error: "トークンの有効期限が切れています" };
  }

  const bookRequest = await prisma.bookRequest.create({
    data: {
      title: result.data.title,
      userId: session.user.id,
      roomId: roomId,
    },
    include: {
      requester: { select: { email: true } },
    },
  });

  await sendRequestNotification({
    adminEmail: room.owner.email,
    bookTitle: result.data.title,
    requesterEmail: bookRequest.requester.email,
    roomName: room.name,
  });

  return { success: true };
}
