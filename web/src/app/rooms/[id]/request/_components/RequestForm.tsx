import { BBAppLink } from "@/components/ui/BBAppLink";
import { BBAppInput } from "@/components/ui";
import { UseFormReturn } from "react-hook-form";
import { type RequestFormData } from "../_consts";

type RequestFormProps = {
    form: UseFormReturn<RequestFormData>;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSubmitting: boolean;
    submitError: string;
};

export function RequestForm({
    form,
    onSubmit,
    isSubmitting,
    submitError,
}: RequestFormProps) {
    const { register, formState: { errors } } = form;

    return (
        <div className="mx-auto max-w-md">
            <div className="mb-8">
                <BBAppLink
                    href="/"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                >
                    ← ホームへ戻る
                </BBAppLink>
            </div>

            <div className="rounded-lg bg-white p-8 shadow dark:bg-zinc-800">
                <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
                    書籍申請
                </h1>

                <form onSubmit={onSubmit} noValidate>
                    <div className="mb-4">
                        <label htmlFor="title" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">書籍タイトル</label>
                        <BBAppInput
                            name="title"
                            register={register}
                            error={errors.title}
                            type="text"
                            placeholder="例: リーダブルコード"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="token" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">アクセストークン</label>
                        <BBAppInput
                            name="token"
                            register={register}
                            error={errors.token}
                            type="text"
                            placeholder="管理者から共有されたトークン"
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            ルーム管理者から共有されたトークンを入力してください
                        </p>
                    </div>

                    {submitError && (
                        <p className="mb-4 text-sm text-red-500">{submitError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? "送信中..." : "申請する"}
                    </button>
                </form>
            </div>
        </div>
    );
}
