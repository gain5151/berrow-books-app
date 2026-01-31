"use client";

type LoginSuccessProps = {
    email: string;
};

export function LoginSuccess({ email }: LoginSuccessProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
                <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
                    メールを確認してください
                </h1>
                <p className="text-center text-zinc-600 dark:text-zinc-400">
                    {email} にログインリンクを送信しました。
                    <br />
                    メールを確認してリンクをクリックしてください。
                </p>
            </div>
        </div>
    );
}
