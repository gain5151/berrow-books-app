# Walkthrough - Efficient Claude Code Structure

Claude Code（および他のAIエージェント）がプロジェクトをより深く、速く理解できるように、以下の構成を構築しました。

## 実施した変更

### 1. プロジェクトルートの最適化
- **[CLAUDE.md](file:///c:/_dev/berrow-books-app/CLAUDE.md)**: ビルド、テスト、リンター、データベース操作のコマンドを明記しました。これにより、エージェントが迷わずコマンドを実行できます。

### 2. .claude/rules (コーディング規約)
- **[style.md](file:///c:/_dev/berrow-books-app/.claude/rules/style.md)**: TypeScriptの使用、命名規則、コンポーネントの書き方を定義。
- **[tech-stack.md](file:///c:/_dev/berrow-books-app/.claude/rules/tech-stack.md)**: Next.js, Prisma, Tailwind CSS などの主要技術を明記。

### 3. .claude/rules/features (機能別ルール) 🆕
- **[auth.md](file:///c:/_dev/berrow-books-app/.claude/rules/features/auth.md)**: 認証ロジックの場所やセキュリティ規約。
- **[books.md](file:///c:/_dev/berrow-books-app/.claude/rules/features/books.md)**: 書籍バリデーションやデータモデルの規約。
- **[rooms.md](file:///c:/_dev/berrow-books-app/.claude/rules/features/rooms.md)**: 在庫管理や物理的な場所の管理ロジック。

### 4. .claude/docs (ドキュメント)
- **[architecture.md](file:///c:/_dev/berrow-books-app/.claude/docs/architecture.md)**: アプリケーションの全体構造とコンポーネントの役割を説明。
- **[schema.md](file:///c:/_dev/berrow-books-app/.claude/docs/schema.md)**: データベースの主要なエンティティ（User, Book, Rental, Room）の概要。

## 期待される効果
- **コンテキストの把握が速くなる**: エージェントが最初にこれらのファイルを読み込むことで、プロジェクトの全体像を即座に理解します。
- **実装のブレがなくなる**: コーディング規約を参照することで、既存のコードと一貫性のある提案が可能になります。
- **エラーの削減**: 正しいコマンドセットが `CLAUDE.md` にあるため、環境構築やテストでの試行錯誤が減ります。
