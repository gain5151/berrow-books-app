/**
 * クライアント側でTryCatchを個別に実装しなくてもいいようにラップした共通関数
 * 
 * @param fn 実行したい関数
 * @returns 関数の実行結果。エラーが発生した場合はundefinedを返す。
 * 
 * @example
 * const data = await catchTrouble(() => fetchData());
 * if (data) {
 *   // 成功時の処理
 * }
 */
export const catchTrouble = async <T>(fn: () => Promise<T> | T): Promise<T | undefined> => {
    try {
        return await fn();
    } catch (error) {
        // クライアント側でのエラーログ出力
        console.error("CatchTrouble:", error);

        // サーバーサイドAPIへのログ送信
        // Promiseの解消を待たずにバックグラウンドで送信を試みる（または必要に応じてawaitする）
        try {
            await fetch("/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    url: typeof window !== "undefined" ? window.location.href : "server-side",
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (logError) {
            // ログ送信自体のエラーはコンソールに出力するのみ
            console.error("Failed to send error log to server:", logError);
        }

        return undefined;
    }
};
