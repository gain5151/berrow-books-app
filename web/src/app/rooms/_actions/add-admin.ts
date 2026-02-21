"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addAdminSchema } from "@/lib/validations/room";

type AddAdminResult =
  | { success: true }
  | { success: false; error: string };

export async function addAdmin(
  roomId: string,
  email: string
): Promise<AddAdminResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証されていません" };
  }

  const result = addAdminSchema.safeParse({ email, roomId });

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
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

  // Find or create user by email
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email },
    });
  }

  // Check if already admin
  const existingAdmin = await prisma.roomAdmin.findUnique({
    where: {
      userId_roomId: {
        userId: user.id,
        roomId,
      },
    },
  });

  if (existingAdmin) {
    return { success: false, error: "このユーザーは既に管理者として登録されています" };
  }

  // Check if trying to add owner as admin
  if (user.id === room.ownerId) {
    return { success: false, error: "オーナーを管理者として追加することはできません" };
  }

  await prisma.roomAdmin.create({
    data: {
      userId: user.id,
      roomId,
    },
  });

  return { success: true };
}
