# Feature Rule: Authentication

## Overview
Handles user login, session management, and access control.

## Rules
- **Logic Location**: All authentication logic must reside in `web/src/lib/auth.ts`.
- **Session Handling**: Use secure cookies for session storage.
- **Access Control**: 
  - Protect sensitive routes using Middleware or Server Component checks.
  - Public routes must be explicitly defined in a whitelist.
- **Icons**: Use `Lucide-React` for auth-related icons (Lock, User, LogIn, etc.).
