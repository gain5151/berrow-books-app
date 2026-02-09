import { BBAppLink } from "@/components/ui/BBAppLink";
import { Input } from "@/components/ui/Input";
import { UseFormReturn } from "react-hook-form";
import { type CreateRoomFormData } from "../_consts";

type CreateRoomFormProps = {
  form: UseFormReturn<CreateRoomFormData>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  submitError: string;
};

export function CreateRoomForm({
  form,
  onSubmit,
  isSubmitting,
  submitError,
}: CreateRoomFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8">
        <BBAppLink
          href="/rooms"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← ルーム一覧へ戻る
        </BBAppLink>
      </div>

      <div className="rounded-lg bg-white p-8 shadow dark:bg-zinc-800">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
          新規ルーム作成
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          ※ 1ユーザーにつき最大5つまで作成できます
        </p>

        <form onSubmit={onSubmit} noValidate>
          <div className="mb-4">
            <Input
              name="name"
              register={register}
              error={errors.name}
              label="ルーム名"
              type="text"
              placeholder="例: 技術書レンタル"
            />
          </div>

          <div className="mb-6">
            <Input
              name="tokenExpiresAt"
              register={register}
              error={errors.tokenExpiresAt}
              label="管理用トークンの有効期限"
              type="datetime-local"
            />
          </div>

          {submitError && (
            <p className="mb-4 text-sm text-red-500">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "作成中..." : "ルームを作成"}
          </button>
        </form>
      </div>
    </div>
  );
}
