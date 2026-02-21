"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type Room } from "../_consts";

type FetchRoomsResult =
  | { success: true; rooms: Room[] }
  | { success: false; error: string };

export async function fetchRooms(): Promise<FetchRoomsResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "認証されていません" };
  }

  const rooms = await prisma.room.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { admins: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { email: true } },
      admins: { include: { user: { select: { email: true } } } },
      _count: { select: { requests: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    rooms: rooms as unknown as Room[],
  };
}
