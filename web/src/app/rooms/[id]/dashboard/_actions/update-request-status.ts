"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRequestStatusSchema } from "@/lib/validations/request";
import {
  sendReturnCompleteNotification,
  sendShippedNotification,
} from "@/lib/email";

type UpdateRequestStatusResult =
  | { success: true }
  | { success: false; error: string };

export async function updateRequestStatus(
  roomId: string,
  requestId: string,
  status: string,
  returnDueDate?: string
): Promise<UpdateRequestStatusResult> {
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

  const result = updateRequestStatusSchema.safeParse({ status, returnDueDate });

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const existingRequest = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    include: { requester: { select: { email: true } } },
  });

  if (!existingRequest || existingRequest.roomId !== roomId) {
    return { success: false, error: "申請が見つかりません" };
  }

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

  return { success: true };
}
