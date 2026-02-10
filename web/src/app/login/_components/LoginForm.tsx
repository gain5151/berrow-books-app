"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../_consts";
import { BBAppInput } from "@/components/ui";
import { BBAppButton } from "@/components/ui";

type LoginFormProps = {
    isLoading: boolean;
    error: string;
    onSubmit: (data: LoginFormData) => void;
};

export function LoginForm({
    isLoading,
    error,
    onSubmit,
}: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "" },
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
                <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
                    Berrow Books
                </h1>
                <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
                    メールアドレスでログイン
                </p>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            メールアドレス
                        </label>
                        <BBAppInput<LoginFormData>
                            name="email"
                            register={register}
                            error={errors.email}
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                        />
                    </div>
                    {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                    <BBAppButton
                        type="submit"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "送信中..." : "ログインリンクを送信"}
                    </BBAppButton>
                </form>
            </div>
        </div>
    );
}
