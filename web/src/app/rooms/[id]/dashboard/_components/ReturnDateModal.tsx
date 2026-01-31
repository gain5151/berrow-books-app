type ReturnDateModalProps = {
    returnDueDate: string;
    onDateChange: (date: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
    isUpdating: boolean;
};

export function ReturnDateModal({
    returnDueDate,
    onDateChange,
    onCancel,
    onConfirm,
    isUpdating,
}: ReturnDateModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-800">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    返却期限を設定
                </h3>
                <input
                    type="date"
                    value={returnDueDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="mb-4 w-full rounded-md border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="rounded-md bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-600 dark:text-zinc-200"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!returnDueDate || isUpdating}
                        className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                        送付済にする
                    </button>
                </div>
            </div>
        </div>
    );
}
