import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRequestStatusSchema } from "@/lib/validations/request";
import {
  sendReturnCompleteNotification,
  sendShippedNotification,
  sendReturnReminder,
} from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { roomId, requestId } = await params;

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

  const body = await request.json();
  const result = updateRequestStatusSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const existingRequest = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    include: { requester: { select: { email: true } } },
  });

  if (!existingRequest || existingRequest.roomId !== roomId) {
    return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 });
  }

  // Build update data based on status
  const updateData: {
    status: "REQUESTED" | "PURCHASED" | "SENT" | "RETURNED";
    purchasedAt?: Date;
    sentAt?: Date;
    returnDueDate?: Date;
    returnedAt?: Date;
  } = {
    status: result.data.status,
  };

  const previousStatus = existingRequest.status;

  switch (result.data.status) {
    case "PURCHASED":
      updateData.purchasedAt = new Date();
      break;
    case "SENT":
      updateData.sentAt = new Date();
      if (result.data.returnDueDate) {
        updateData.returnDueDate = new Date(result.data.returnDueDate);
      }
      break;
    case "RETURNED":
      updateData.returnedAt = new Date();
      break;
  }

  const updatedRequest = await prisma.bookRequest.update({
    where: { id: requestId },
    data: updateData,
    include: { requester: { select: { email: true } } },
  });

  // Send email notifications based on status change
  if (result.data.status === "SENT" && previousStatus !== "SENT") {
    await sendShippedNotification({
      userEmail: updatedRequest.requester.email,
      bookTitle: updatedRequest.title,
      returnDueDate: updatedRequest.returnDueDate || undefined,
    });
  }

  if (result.data.status === "RETURNED" && previousStatus !== "RETURNED") {
    await sendReturnCompleteNotification({
      userEmail: updatedRequest.requester.email,
      bookTitle: updatedRequest.title,
    });
  }

  return NextResponse.json(updatedRequest);
}

// 返却期限リマインダー送信（手動トリガー用）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; requestId: string }> }
) {
  const session = await getServerSession(authOptions);
  const { roomId, requestId } = await params;

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

  const bookRequest = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    include: { requester: { select: { email: true } } },
  });

  if (!bookRequest || bookRequest.roomId !== roomId) {
    return NextResponse.json({ error: "申請が見つかりません" }, { status: 404 });
  }

  if (!bookRequest.returnDueDate) {
    return NextResponse.json({ error: "返却期限が設定されていません" }, { status: 400 });
  }

  if (bookRequest.status === "RETURNED") {
    return NextResponse.json({ error: "既に返却済みです" }, { status: 400 });
  }

  await sendReturnReminder({
    userEmail: bookRequest.requester.email,
    bookTitle: bookRequest.title,
    returnDueDate: bookRequest.returnDueDate,
  });

  return NextResponse.json({ success: true, message: "リマインダーを送信しました" });
}
