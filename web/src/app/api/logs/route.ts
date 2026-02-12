import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * クライアント側からのエラーログを受け取り、サーバー側のコンソールに出力するAPI
 * 認証済みのユーザーのみ実行可能
 */
export async function POST(request: Request) {
    try {
        // セッション情報の有無をチェック
        const session = await getServerSession(authOptions);
        if (!session) {
            // 未ログインの場合は何も処理せず終了（セキュリティのため401を返す）
            return new Response(null, { status: 401 });
        }

        const body = await request.json();
        const { message, stack, url, timestamp } = body;

        console.error("--- Client-Side Error Log ---");
        console.error(`User: ${session.user?.email || "Unknown"}`);
        console.error(`Timestamp: ${timestamp || new Date().toISOString()}`);
        console.error(`URL: ${url}`);
        console.error(`Message: ${message}`);
        if (stack) {
            console.error(`Stack: ${stack}`);
        }
        console.error("-----------------------------");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to process client log:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
