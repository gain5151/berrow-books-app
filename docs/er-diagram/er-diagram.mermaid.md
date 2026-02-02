# ER Diagram - Berrow Books App

```mermaid
erDiagram
    %% ========== Enums ==========
    Status {
        string REQUESTED
        string PURCHASED
        string SENT
        string RETURNED
    }

    %% ========== Business Models ==========
    User {
        string id PK
        string email UK
        datetime emailVerified
        string image
    }

    Room {
        string id PK
        string name
        string token UK
        datetime tokenExpiresAt
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    RoomAdmin {
        string id PK
        string userId FK
        string roomId FK
    }

    BookRequest {
        string id PK
        string title
        Status status
        string userId FK
        string roomId FK
        datetime requestedAt
        datetime purchasedAt
        datetime sentAt
        datetime returnDueDate
        datetime returnedAt
    }

    %% ========== NextAuth Models ==========
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }

    %% ========== Relations ==========
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ Room : "owns"
    User ||--o{ RoomAdmin : "administers"
    User ||--o{ BookRequest : "requests"

    Room ||--o{ RoomAdmin : "has admins"
    Room ||--o{ BookRequest : "contains"

    BookRequest }o--|| Status : "has status"
```

## Legend

| 記号 | 意味 |
|------|------|
| PK | Primary Key (主キー) |
| FK | Foreign Key (外部キー) |
| UK | Unique Key (一意キー) |
| `\|\|--o{` | 1対多 |
| `\|\|--\|\|` | 1対1 |
| `}o--\|\|` | 多対1 |

## Models Overview

### Business Logic
- **User**: アプリケーションユーザー
- **Room**: 書籍の保管場所
- **RoomAdmin**: 部屋の管理者（User と Room の中間テーブル）
- **BookRequest**: 書籍リクエスト

### NextAuth
- **Account**: OAuth アカウント情報
- **Session**: セッション管理
- **VerificationToken**: メール検証トークン

### Enum
- **Status**: 書籍リクエストの状態 (REQUESTED → PURCHASED → SENT → RETURNED)
