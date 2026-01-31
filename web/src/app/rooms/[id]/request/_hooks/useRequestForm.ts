"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestSchema, type RequestFormData } from "../_consts";

export function useRequestForm(roomId: string) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<RequestFormData>({
        resolver: zodResolver(requestSchema),
    });

    const onSubmit = async (data: RequestFormData) => {
        setIsSubmitting(true);
        setSubmitError("");

        try {
            const res = await fetch(`/api/rooms/${roomId}/requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                setIsSuccess(true);
            } else {
                const result = await res.json();
                setSubmitError(result.error || "申請に失敗しました");
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
        isSuccess,
        onSubmit: form.handleSubmit(onSubmit),
    };
}
