"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createRoomSchema, type CreateRoomFormData } from "../_consts";

export function useCreateRoomForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      tokenExpiresAt: "",
    },
  });

  // Set default expiry to 30 days from now
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    form.setValue("tokenExpiresAt", defaultDate.toISOString().slice(0, 16));
  }, [form]);

  const onSubmit = async (data: CreateRoomFormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/rooms");
      } else {
        const result = await res.json();
        setSubmitError(result.error || "ルームの作成に失敗しました");
      }
    } catch {
      setSubmitError("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    submitError,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
