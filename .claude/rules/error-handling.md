# クライアント側エラーハンドリング規約

クライアント側（ブラウザ側）で実行される関数における例外処理の標準的な手法を以下に定める。

## 基本原則
- ユーザーインタラクション（ボタンクリック、リンククリック等）から**直接呼び出されない**関数については、原則として関数全体を **`catchTrouble`** 関数でラップすること。
- 直接呼び出されるイベントハンドラー内などでサブ関数を呼び出す際、そのサブ関数のロジックを保護するために使用する。

## なぜ `catchTrouble` を使うのか
- **一貫したエラーハンドリング**: 開発者が個別に `try-catch` を書く手間を省き、一貫した動作を保証する。
- **自動ロギング**: `catchTrouble` は内部でサーバーサイドのログAPI（`/api/logs`）を呼び出すため、エラー発生時に自動的にサーバーログへ詳細が記録される。
- **ユーザー体験の維持**: 予期せぬエラーでアプリケーション全体がクラッシュ（White Screen）するのを防ぎ、`undefined` を返すことで呼び出し側が安全に縮退運転できるようにする。

## 実装規約
1. **インポート**: `@/lib/wrappClient/CatchTrouble` から `catchTrouble` をインポートする。
2. **ラップ**: 非同期処理を含むロジックを `await catchTrouble(async () => { ... })` の形式で包む。
3. **戻り値**: `catchTrouble` は成功時は関数の戻り値を、エラー時は `undefined` を返す。呼び出し側では戻り値が `undefined` の場合の処理（トースト通知、リターン等）を適切に行うこと。

## 実装例

### よくない例（生の try-catch または未処理）
```tsx
const fetchData = async () => {
    // エラーが発生すると呼び出し元のUIまで伝播し、クラッシュする可能性がある
    const res = await fetch('/api/data');
    return res.json();
};
```

### よい例（catchTrouble による保護）
```tsx
import { catchTrouble } from "@/lib/wrappClient/CatchTrouble";

// UIから直接呼ばれない、内部ロジック関数
const getProtectedData = async () => {
    return await catchTrouble(async () => {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error("Failed to fetch data");
        return await res.json();
    });
};

// UIイベントハンドラー（直接呼び出される側）
const handleClick = async () => {
    const data = await getProtectedData();
    if (!data) {
        // エラー時は適切にユーザーに通知する
        toast.error("データの取得に失敗しました。管理者に通知されました。");
        return;
    }
    // 成功時の処理
    console.log(data);
};
```

## 注意点
- **ボタンの `onClick` などに直接 `catchTrouble` を適用しない**: イベントハンドラー自体はUIとの接点であり、エラー表示の責務を持つため、その内部で呼び出す関数をラップ対象とする。
- **サーバーサイドでの使用禁止**: `catchTrouble` はクライアント（ブラウザ）専用に設計されているため、Server Components や Server Actions では使用しないこと。
