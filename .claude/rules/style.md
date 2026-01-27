# コーディングスタイルと規約

- **言語**: すべてのWebコードで TypeScript を使用。
- **コンポーネント**: React 関数コンポーネントと Tailwind CSS を使用。
- **命名規則**: 
  - コンポーネント: PascalCase
  - 関数/変数: camelCase
  - ファイル名: kebab-case (例: `user-profile.tsx`)
- **状態管理**: React Hooks (useState, useMemo など) を使用。
- **データ取得**: 可能な限り Server Components を使用し、それ以外は標準の fetch または API routes を使用。
