"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRoomSchema } from "@/lib/validations/room";
import { randomBytes } from "crypto";

const MAX_ROOMS_PER_USER = 5;

type CreateRoomResult =
  | { success: true }
  | { success: false; error: string };

export async function createRoom(data: {
  name: string;
  tokenExpiresAt: string;
}): Promise<CreateRoomResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証されていません" };
  }

  const result = createRoomSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const existingRoomsCount = await prisma.room.count({
    where: { ownerId: session.user.id },
  });

  if (existingRoomsCount >= MAX_ROOMS_PER_USER) {
    return {
      success: false,
      error: `ルームは最大${MAX_ROOMS_PER_USER}つまで作成できます`,
    };
  }

  const token = randomBytes(32).toString("hex");

  await prisma.room.create({
    data: {
      name: result.data.name,
      token,
      tokenExpiresAt: new Date(result.data.tokenExpiresAt),
      ownerId: session.user.id,
    },
  });

  return { success: true };
}
