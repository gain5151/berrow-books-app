"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useRequestForm } from "./_hooks/useRequestForm";
import { RequestForm } from "./_components/RequestForm";
import { RequestSuccess } from "./_components/RequestSuccess";
import { LoadingView } from "./_components/States";

export default function RequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const {
    form,
    isSubmitting,
    submitError,
    isSuccess,
    onSubmit,
  } = useRequestForm(roomId);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingView />;
  }

  if (!session) return null;

  if (isSuccess) {
    return <RequestSuccess />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <RequestForm
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
