"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RemoveAdminResult =
  | { success: true }
  | { success: false; error: string };

export async function removeAdmin(
  roomId: string,
  adminId: string
): Promise<RemoveAdminResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証されていません" };
  }

  // Check if user is owner of the room
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      ownerId: session.user.id,
    },
  });

  if (!room) {
    return { success: false, error: "ルームが見つからないか、権限がありません" };
  }

  await prisma.roomAdmin.delete({
    where: { id: adminId },
  });

  return { success: true };
}
