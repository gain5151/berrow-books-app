"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Room, addAdminSchema, type AddAdminFormData } from "../_consts";
import { BBAppButton, BBAppInput } from "@/components/ui";

type AdminModalProps = {
    selectedRoom: Room;
    onClose: () => void;
    onSubmit: (email: string) => Promise<{ success: boolean; error?: string }>;
    addingAdmin: boolean;
    adminError: string;
};

export function AdminModal({
    selectedRoom,
    onClose,
    onSubmit,
    addingAdmin,
    adminError,
}: AdminModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AddAdminFormData>({
        resolver: zodResolver(addAdminSchema),
        defaultValues: { email: "" },
    });

    const handleFormSubmit = async (data: AddAdminFormData) => {
        await onSubmit(data.email);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-800">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    管理者を追加 - {selectedRoom.name}
                </h3>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="mb-4">
                        <BBAppInput<AddAdminFormData>
                            name="email"
                            register={register}
                            error={errors.email}
                            type="email"
                            placeholder="メールアドレス"
                        />
                    </div>
                    {adminError && (
                        <p className="mb-4 text-sm text-red-500">{adminError}</p>
                    )}
                    <div className="flex justify-end gap-2">
                        <BBAppButton
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            キャンセル
                        </BBAppButton>
                        <BBAppButton
                            type="submit"
                            isLoading={addingAdmin}
                        >
                            {addingAdmin ? "追加中..." : "追加"}
                        </BBAppButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
