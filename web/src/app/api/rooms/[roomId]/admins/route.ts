import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addAdminSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレスを入力してください"),
});

/** 指定ルームの管理者一覧を取得する */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { roomId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      OR: [
        { ownerId: session.user.id },
        { admins: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      admins: { include: { user: { select: { id: true, email: true } } } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room.admins);
}

/** 指定ルームに管理者を追加する */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { roomId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = addAdminSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  // Check if user is owner of the room
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      ownerId: session.user.id,
    },
  });

  if (!room) {
    return NextResponse.json(
      { error: "ルームが見つからないか、権限がありません" },
      { status: 404 }
    );
  }

  // Find or create user by email
  let user = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email: result.data.email },
    });
  }

  // Check if already admin
  const existingAdmin = await prisma.roomAdmin.findUnique({
    where: {
      userId_roomId: {
        userId: user.id,
        roomId: roomId,
      },
    },
  });

  if (existingAdmin) {
    return NextResponse.json(
      { error: "このユーザーは既に管理者として登録されています" },
      { status: 400 }
    );
  }

  // Check if trying to add owner as admin
  if (user.id === room.ownerId) {
    return NextResponse.json(
      { error: "オーナーを管理者として追加することはできません" },
      { status: 400 }
    );
  }

  const admin = await prisma.roomAdmin.create({
    data: {
      userId: user.id,
      roomId: roomId,
    },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  return NextResponse.json(admin, { status: 201 });
}

/** 指定ルームから管理者を削除する */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { roomId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get("adminId");

  if (!adminId) {
    return NextResponse.json({ error: "adminId is required" }, { status: 400 });
  }

  // Check if user is owner of the room
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      ownerId: session.user.id,
    },
  });

  if (!room) {
    return NextResponse.json(
      { error: "ルームが見つからないか、権限がありません" },
      { status: 404 }
    );
  }

  await prisma.roomAdmin.delete({
    where: { id: adminId },
  });

  return NextResponse.json({ success: true });
}
