"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCreateRoomForm } from "./_hooks/useCreateRoomForm";
import { CreateRoomForm } from "./_components/CreateRoomForm";
import { LoadingView } from "./_components/States";

export default function NewRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    form,
    isSubmitting,
    submitError,
    onSubmit,
  } = useCreateRoomForm();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingView />;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <CreateRoomForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
