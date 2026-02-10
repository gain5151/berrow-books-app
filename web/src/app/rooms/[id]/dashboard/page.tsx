"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDashboardData } from "./_hooks/useDashboardData";
import { DashboardHeader } from "./_components/DashboardHeader";
import { RequestTable } from "./_components/RequestTable";
import { ReturnDateModal } from "./_components/ReturnDateModal";
import { LoadingView, EmptyState } from "./_components/States";
import { BookRequestStatus } from "./_consts";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const roomId = params.id as string;

  const {
    requests,
    room,
    isLoading,
    error,
    updatingId,
    updateStatus,
    sendReminder,
    copyToken,
  } = useDashboardData(roomId, session, status);

  const [showDateModal, setShowDateModal] = useState<string | null>(null);

  const handleUpdateStatus = async (requestId: string, nextStatus: any) => {
    const result = await updateStatus(requestId, nextStatus);
    if (!result.success && result.error) {
      alert(result.error);
    }
  };

  const handleConfirmSent = async (returnDueDate: string) => {
    if (!showDateModal) return;
    const result = await updateStatus(showDateModal, BookRequestStatus.SENT, returnDueDate);
    if (result.success) {
      setShowDateModal(null);
    } else if (result.error) {
      alert(result.error);
    }
  };

  if (status === "loading" || isLoading) {
    return <LoadingView />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-6xl">
        <DashboardHeader
          room={room}
          roomId={roomId}
          onCopyToken={copyToken}
        />

        {error && <p className="mb-4 text-red-500">{error}</p>}

        {requests.length === 0 ? (
          <EmptyState />
        ) : (
          <RequestTable
            requests={requests}
            updatingId={updatingId}
            onUpdateStatus={handleUpdateStatus}
            onShowDateModal={setShowDateModal}
            onSendReminder={sendReminder}
          />
        )}

        {showDateModal && (
          <ReturnDateModal
            onCancel={() => setShowDateModal(null)}
            onConfirm={handleConfirmSent}
            isUpdating={updatingId === showDateModal}
          />
        )}
      </div>
    </div>
  );
}
