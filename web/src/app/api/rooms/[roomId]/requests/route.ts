import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRequestSchema } from "@/lib/validations/request";
import { sendRequestNotification } from "@/lib/email";

// 申請一覧取得（管理者用）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { roomId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const requests = await prisma.bookRequest.findMany({
    where: { roomId },
    include: {
      requester: { select: { email: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json(requests);
}

// 新規申請
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
  const result = createRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verify room and token
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: { select: { email: true } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "ルームが見つかりません" }, { status: 404 });
  }

  // Check token
  if (room.token !== result.data.token) {
    return NextResponse.json({ error: "トークンが無効です" }, { status: 403 });
  }

  // Check token expiry
  if (new Date() > room.tokenExpiresAt) {
    return NextResponse.json({ error: "トークンの有効期限が切れています" }, { status: 403 });
  }

  // Create request
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

  // Send notification to room owner
  await sendRequestNotification({
    adminEmail: room.owner.email,
    bookTitle: result.data.title,
    requesterEmail: bookRequest.requester.email,
    roomName: room.name,
  });

  return NextResponse.json(bookRequest, { status: 201 });
}
