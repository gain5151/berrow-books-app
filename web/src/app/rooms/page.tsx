"use client";

import { useSession } from "next-auth/react";
import { useRoomsData } from "./_hooks/useRoomsData";
import { RoomsHeader } from "./_components/RoomsHeader";
import { RoomCard } from "./_components/RoomCard";
import { AdminModal } from "./_components/AdminModal";
import { LoadingView, EmptyRoomsView } from "./_components/States";

export default function RoomsPage() {
  const { data: session, status } = useSession();

  const {
    rooms,
    isLoading,
    error,
    selectedRoom,
    setSelectedRoom,
    adminEmail,
    setAdminEmail,
    addingAdmin,
    adminError,
    setAdminError,
    handleAddAdmin,
    handleRemoveAdmin,
  } = useRoomsData(session, status);

  if (status === "loading" || isLoading) {
    return <LoadingView />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl">
        <RoomsHeader />

        {error && <p className="mb-4 text-red-500">{error}</p>}

        {rooms.length === 0 ? (
          <EmptyRoomsView />
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                currentUserId={session.user.id}
                onAddAdmin={setSelectedRoom}
                onRemoveAdmin={handleRemoveAdmin}
              />
            ))}
          </div>
        )}

        {selectedRoom && (
          <AdminModal
            selectedRoom={selectedRoom}
            adminEmail={adminEmail}
            onAdminEmailChange={setAdminEmail}
            onClose={() => {
              setSelectedRoom(null);
              setAdminEmail("");
              setAdminError("");
            }}
            onSubmit={handleAddAdmin}
            addingAdmin={addingAdmin}
            adminError={adminError}
          />
        )}
      </div>
    </div>
  );
}
