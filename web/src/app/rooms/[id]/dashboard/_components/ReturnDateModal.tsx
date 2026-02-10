"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { returnDateSchema, type ReturnDateFormData } from "../_consts";
import { BBAppButton } from "@/components/ui";
import { BBAppInput } from "@/components/ui";

type ReturnDateModalProps = {
    onCancel: () => void;
    onConfirm: (returnDueDate: string) => void;
    isUpdating: boolean;
};

export function ReturnDateModal({
    onCancel,
    onConfirm,
    isUpdating,
}: ReturnDateModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ReturnDateFormData>({
        resolver: zodResolver(returnDateSchema),
        defaultValues: { returnDueDate: "" },
    });

    const handleFormSubmit = (data: ReturnDateFormData) => {
        onConfirm(data.returnDueDate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-800">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    返却期限を設定
                </h3>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="mb-4">
                        <BBAppInput<ReturnDateFormData>
                            name="returnDueDate"
                            register={register}
                            error={errors.returnDueDate}
                            type="date"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <BBAppButton
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            キャンセル
                        </BBAppButton>
                        <BBAppButton
                            type="submit"
                            isLoading={isUpdating}
                            className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-300"
                        >
                            送付済にする
                        </BBAppButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
