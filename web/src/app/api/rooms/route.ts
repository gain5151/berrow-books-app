import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRoomSchema } from "@/lib/validations/room";
import { randomBytes } from "crypto";

const MAX_ROOMS_PER_USER = 5;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = createRoomSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  // Check room limit
  const existingRoomsCount = await prisma.room.count({
    where: { ownerId: session.user.id },
  });

  if (existingRoomsCount >= MAX_ROOMS_PER_USER) {
    return NextResponse.json(
      { error: `ルームは最大${MAX_ROOMS_PER_USER}つまで作成できます` },
      { status: 400 }
    );
  }

  // Generate unique token
  const token = randomBytes(32).toString("hex");

  const room = await prisma.room.create({
    data: {
      name: result.data.name,
      token,
      tokenExpiresAt: new Date(result.data.tokenExpiresAt),
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(room, { status: 201 });
}
