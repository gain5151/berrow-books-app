# カスタムコンポーネント作成規約

プロジェクト独自のカスタムコンポーネント（共通UIコンポーネントなど）を作成する際は、以下の規約を遵守すること。


## 命名規則
- コンポーネント名の先頭には、必ず **「BBApp」** を付与すること。
  - 理由: 標準のHTML要素（`input`, `button` など）や他のライブラリのコンポーネントとの混同を避け、実装時のインポートミスを防止するため。
  - 例: `BBAppInput`, `BBAppButton`, `BBAppSelect`, `BBAppTextarea`

## インポートの規約
- `src` フォルダ配下のリソースをインポートする場合は、必ずエイリアス **`@/`** を使用すること。
  - よい例）`import { authOptions } from "@/lib/auth"`
  - 悪い例）`import { authOptions } from "~/lib/auth"`

## 実装の原則
- **構造は可能な限りシンプルなものとし、指示していない機能は基本的に実装しないこと。**
- **指示していない機能を実装しようとする場合は、必ず事前に確認メッセージを送信し、許可を得てから進めること。**

## バリデーションとフォーム連携
- 入力値のバリデーションには **Zod** を、フォーム管理には **react-hook-form** を使用することを前提とする。
- カスタムコンポーネントは、必要に応じて `useForm` から取得できる `register` やその他のプロパティを引数として受け取れるように設計すること。

## スタイル
- スタイル定義には **Tailwind CSS** を使用すること。
- 外部からスタイルを調整できるよう、必ず `className` プロパティを受け取り、内部の要素と結合（merge）できること。
  - `clsx` や `tailwind-merge` などのライブラリが導入されている場合は、それらを使用してクラス名を結合すること。

## 実装例（BBAppInput の場合）
```tsx
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UseFormRegister, FieldValues, Path, FieldError } from 'react-hook-form';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// フォーム連携用の型定義を含むProps
interface BBAppInputProps<T extends FieldValues = FieldValues> 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string | FieldError;
}

export const BBAppInput = <T extends FieldValues = FieldValues>({ 
  className, 
  error, 
  register, 
  name, 
  ...props 
}: BBAppInputProps<T>) => {
  // registerを適用
  const registration = register(name);
  
  // エラーメッセージの抽出
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="flex flex-col gap-1 w-full">
      <input
        {...props}
        {...registration}
        className={cn(
          "border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 border-zinc-300 dark:border-zinc-600 dark:bg-zinc-700",
          errorMessage && "border-red-500 focus:ring-red-500",
          className
        )}
      />
      {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
    </div>
  );
};
```
