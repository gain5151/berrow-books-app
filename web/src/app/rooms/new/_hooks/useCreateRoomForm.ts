"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { catchTrouble } from "@/lib/wrappClient/CatchTrouble";
import { createRoomSchema, DEFAULT_TOKEN_EXPIRY_DAYS, type CreateRoomFormData } from "../_consts";
import { createRoom } from "../_actions/create-room";

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

  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + DEFAULT_TOKEN_EXPIRY_DAYS);
    form.setValue("tokenExpiresAt", defaultDate.toISOString().slice(0, 16));
  }, [form]);

  const _executeCreateRoom = async (data: CreateRoomFormData) => {
    return await catchTrouble(async () => {
      return await createRoom(data);
    });
  };

  const handleSubmit = async (data: CreateRoomFormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    const result = await _executeCreateRoom(data);

    if (!result) {
      setSubmitError("エラーが発生しました");
      setIsSubmitting(false);
      return;
    }

    if (result.success) {
      router.push("/rooms");
    } else {
      setSubmitError(result.error);
    }

    setIsSubmitting(false);
  };

  return {
    form,
    isSubmitting,
    submitError,
    onSubmit: form.handleSubmit(handleSubmit),
  };
}
