# アーキテクチャ概要

Berrow Books App は、Next.js と Prisma で構築された書籍レンタルサービスです。

## コンポーネント
- **Web App**: `web/` フォルダに配置。Next.js App Router を使用。
- **Library**: `web/src/lib` 内の認証およびドメインサービスのカスタムロジック。
- **Database**: Prisma で管理される PostgreSQL。

## データフロー
1. ユーザーが Next.js コンポーネントを操作
2. Server Actions または API routes がロジックを処理
3. Prisma がデータベースと通信
