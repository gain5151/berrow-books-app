import { type BookRequest, STATUS_LABELS, STATUS_COLORS, BookRequestStatus } from "../_consts";
import { BBAppButton } from "@/components/ui";

type RequestTableProps = {
    requests: BookRequest[];
    updatingId: string | null;
    onUpdateStatus: (requestId: string, nextStatus: BookRequest["status"]) => void;
    onShowDateModal: (requestId: string) => void;
    onSendReminder: (requestId: string) => void;
};

export function RequestTable({
    requests,
    updatingId,
    onUpdateStatus,
    onShowDateModal,
    onSendReminder,
}: RequestTableProps) {
    const getNextStatus = (current: BookRequest["status"]): BookRequest["status"] | null => {
        switch (current) {
            case BookRequestStatus.REQUESTED:
                return BookRequestStatus.PURCHASED;
            case BookRequestStatus.PURCHASED:
                return BookRequestStatus.SENT;
            case BookRequestStatus.SENT:
                return BookRequestStatus.RETURNED;
            default:
                return null;
        }
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                            書籍タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                            申請者
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                            ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                            返却期限
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                            アクション
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {requests.map((req) => {
                        const nextStatus = getNextStatus(req.status);
                        const isOverdue =
                            req.returnDueDate &&
                            new Date(req.returnDueDate) < new Date() &&
                            req.status === BookRequestStatus.SENT;

                        return (
                            <tr key={req.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900 dark:text-white">
                                    {req.title}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                    {req.requester.email}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${STATUS_COLORS[req.status]}`}
                                    >
                                        {STATUS_LABELS[req.status]}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    {req.returnDueDate ? (
                                        <span className={isOverdue ? "text-red-500 font-semibold" : "text-zinc-500 dark:text-zinc-400"}>
                                            {new Date(req.returnDueDate).toLocaleDateString("ja-JP")}
                                            {isOverdue && " (期限超過)"}
                                        </span>
                                    ) : (
                                        <span className="text-zinc-400">-</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <div className="flex gap-2">
                                        {nextStatus && (
                                            <>
                                                {nextStatus === BookRequestStatus.SENT ? (
                                                    <button
                                                        onClick={() => onShowDateModal(req.id)}
                                                        disabled={updatingId === req.id}
                                                        className="rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700 disabled:opacity-50"
                                                    >
                                                        送付済にする
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onUpdateStatus(req.id, nextStatus)}
                                                        disabled={updatingId === req.id}
                                                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        {STATUS_LABELS[nextStatus]}にする
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {req.status === BookRequestStatus.SENT && req.returnDueDate && (
                                            <BBAppButton
                                                size="sm"
                                                onClick={() => onSendReminder(req.id)}
                                                className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                                            >
                                                催促
                                            </BBAppButton>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
