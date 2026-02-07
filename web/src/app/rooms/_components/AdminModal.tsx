import { type Room } from "../_consts";
import { BBAppButton } from "@/components/ui";

type AdminModalProps = {
    selectedRoom: Room;
    adminEmail: string;
    onAdminEmailChange: (email: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    addingAdmin: boolean;
    adminError: string;
};

export function AdminModal({
    selectedRoom,
    adminEmail,
    onAdminEmailChange,
    onClose,
    onSubmit,
    addingAdmin,
    adminError,
}: AdminModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-800">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                    管理者を追加 - {selectedRoom.name}
                </h3>
                <form onSubmit={onSubmit}>
                    <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => onAdminEmailChange(e.target.value)}
                        placeholder="メールアドレス"
                        className="mb-4 w-full rounded-md border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                    />
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
