"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type BookRequest, type Room } from "../_consts";

type FetchDashboardDataResult =
  | { success: true; requests: BookRequest[]; room: Room | null }
  | { success: false; error: string };

export async function fetchDashboardData(
  roomId: string
): Promise<FetchDashboardDataResult> {
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

  const requests = await prisma.bookRequest.findMany({
    where: { roomId },
    include: {
      requester: { select: { email: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return {
    success: true,
    requests: requests as unknown as BookRequest[],
    room: { id: room.id, name: room.name, token: room.token },
  };
}
