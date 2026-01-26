書籍レンタルアプリ "berrow-books-app" の開発を開始します。まず、プロジェクトの基盤と認証機能を実装してください。

【環境・技術スタック】
- ディレクトリ: `web` フォルダ内に作成
- Framework: Next.js (App Router), TypeScript
- UI: Tailwind CSS, Shadcn UI
- DB: Prisma (PostgreSQL)
- Auth: NextAuth.js (Resend Providerによるマジックリンク)
- Validation: Zod

【要件】
1. `npx create-next-app` で `web` フォルダにプロジェクトを初期化（srcフォルダ使用、ESLint有効、パスエイリアス設定）。
2. Prismaを導入。
3. 同フォルダにある `00_schema.prisma` を `prisma/schema.prisma` として配置し、初期マイグレーションを実行してください。
4. NextAuth.js を設定し、`/login` ページを作成。
   - Eメール入力フォームのみ存在。パスワードは不要。
   - Resend経由でマジックリンクを送信。
   - ログイン成功後、新規ユーザーの場合は自動的に DB に保存。
5. `/` (ホーム) はログイン済みユーザーのみアクセス可能とし、ログアウトボタンを設置。
