"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { catchTrouble } from "@/lib/wrappClient/CatchTrouble";
import { requestSchema, type RequestFormData } from "../_consts";
import { createRequest } from "../_actions/create-request";

export function useRequestForm(roomId: string) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<RequestFormData>({
        resolver: zodResolver(requestSchema),
    });

    const _executeCreateRequest = async (data: RequestFormData) => {
        return await catchTrouble(async () => {
            return await createRequest(roomId, data);
        });
    };

    const handleSubmit = async (data: RequestFormData) => {
        setIsSubmitting(true);
        setSubmitError("");

        const result = await _executeCreateRequest(data);

        if (!result) {
            setSubmitError("エラーが発生しました");
            setIsSubmitting(false);
            return;
        }

        if (result.success) {
            setIsSuccess(true);
        } else {
            setSubmitError(result.error);
        }

        setIsSubmitting(false);
    };

    return {
        form,
        isSubmitting,
        submitError,
        isSuccess,
        onSubmit: form.handleSubmit(handleSubmit),
    };
}
