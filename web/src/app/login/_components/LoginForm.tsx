"use client";

type LoginFormProps = {
    email: string;
    isLoading: boolean;
    validationError: string;
    error: string;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
};

export function LoginForm({
    email,
    isLoading,
    validationError,
    error,
    onEmailChange,
    onSubmit,
}: LoginFormProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-zinc-800">
                <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
                    Berrow Books
                </h1>
                <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
                    メールアドレスでログイン
                </p>
                <form onSubmit={onSubmit} noValidate>
                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={onEmailChange}
                            placeholder="you@example.com"
                            className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white ${validationError
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600"
                                }`}
                        />
                        {validationError && (
                            <p className="mt-1 text-sm text-red-500">{validationError}</p>
                        )}
                    </div>
                    {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isLoading ? "送信中..." : "ログインリンクを送信"}
                    </button>
                </form>
            </div>
        </div>
    );
}
