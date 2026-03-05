# WOW Project Manual

This manual documents the complete repository structure for `my-app` and provides a maintainable reference for onboarding, maintenance, and feature development.

## Manual Contents

- `docs/manual/architecture-and-structure.md`
  - Explains each top-level and major nested folder.
  - Describes how runtime flow moves through UI routes, API routes, and feature modules.
- `docs/manual/file-index.md`
  - Complete index of every tracked file in the repository.
- `docs/manual/file-catalog-professional.md`
  - Professional per-file catalog with one-line responsibility notes.

## Quick Architectural Summary

- **Frontend framework:** Next.js App Router (`src/app`)
- **API runtime:** Hono, mounted through Next catch-all API route
- **Backend service:** Appwrite (auth, users, databases)
- **Domain modules:** feature-first (`auth`, `workspaces`, `projects`, `tasks`, `members`)
- **Shared UI system:** reusable components + UI primitives in `src/components`
- **Cross-cutting libraries:** `src/lib`

## Data and Request Flow

1. Pages/layouts in `src/app` render views and invoke feature hooks.
2. Hooks in `src/features/*/api` call typed RPC client from `src/lib/rpc.ts`.
3. RPC requests hit `src/app/api/[[...route]]/route.ts`.
4. The Hono app dispatches to feature routers in `src/features/*/server/route.ts`.
5. Feature routers access Appwrite through clients/middleware in `src/lib`.

## Maintenance Notes

- Keep feature code colocated inside its feature folder (`api`, `components`, `hooks`, `server`, `types`, `schemas`).
- Prefer updating this manual whenever new folders or route groups are added.
- Use `file-index.md` as the canonical inventory when auditing or onboarding.
