# Architecture Overview

Berrow Books App is a book rental service built with Next.js and Prisma.

## Components
- **Web App**: Located in `web/`, uses Next.js App Router.
- **Library**: Custom logic for authentication and domain services in `web/src/lib`.
- **Database**: PostgreSQL managed via Prisma.

## Flow
1. User interacts with Next.js components.
2. Server Actions/API routes handle logic.
3. Prisma interacts with the database.
