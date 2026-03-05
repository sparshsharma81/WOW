# Architecture and Folder Structure Guide

This guide explains the purpose of each folder and how the repository is organized.

## 1) Repository Root

- **Root config files** (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `eslint.config.mjs`, `next.config.ts`, etc.) define build/runtime/tooling behavior.
- **`public/`** stores static assets served directly by Next.js.
- **`docs/`** contains project documentation.
- **`src/`** contains all application source code.

---

## 2) `docs/`

### `docs/project-handbook/`
Reserved for handbook-style project docs.

### `docs/manual/`
Manual set generated for operational and architecture documentation:
- `README.md`
- `architecture-and-structure.md`
- `file-index.md`

---

## 3) `public/`

Contains static files (logos/icons) delivered as-is by Next.js.

---

## 4) `src/` Overview

`src` is organized by runtime concern:

- `app/`: App Router pages, route groups, layouts, API and OAuth handlers
- `components/`: shared reusable UI and app-level components
- `features/`: domain modules (auth, workspaces, projects, tasks, members)
- `hooks/`: cross-feature custom hooks
- `lib/`: shared infrastructure/utilities
- `config.ts`: environment-based Appwrite resource IDs

---

## 5) `src/app/` (Next.js App Router)

### Core app files
- `layout.tsx`: root layout + providers + global toaster
- `globals.css`: global styles/Tailwind layers
- `loading.tsx`: root loading fallback
- `error.tsx`: root error boundary UI
- `favicon.ico`: favicon

### Route groups

#### `(auth)/`
Unauthenticated flows.
- `sign-in/page.tsx`
- `sign-up/page.tsx`
- `layout.tsx`

#### `(dashboard)/`
Primary authenticated shell and workspace/task/project pages.
- top-level `layout.tsx` and dashboard index `page.tsx`
- nested workspace/project/task dynamic routes under `workspaces/[workspaceId]/...`

#### `(standalone)/`
Focused standalone pages outside dashboard shell (join, settings, member pages, create workspace flow).
- `layout.tsx`
- `workspaces/create/page.tsx`
- `workspaces/[workspaceId]/...` (join, settings, members, project settings)

### API integration points

#### `api/[[...route]]/route.ts`
Catch-all Next route mounting the Hono API (`/api/*`) and registering feature routers.

#### `oauth/route.ts`
OAuth callback/session route.

### `fonts/`
Bundled app font assets.

---

## 6) `src/components/`

Reusable UI components used across route groups and features.

- App-shell components: `navbar.tsx`, `sidebar.tsx`, `mobile-sidebar.tsx`, `navigation.tsx`
- Shared state/provider: `query-provider.tsx`
- Generic pages/states: `page-loader.tsx`, `page-error.tsx`, `responsive-modal.tsx`
- Domain-agnostic widgets: analytics cards, date-picker, separators, switchers

### `src/components/ui/`
Design-system primitives and wrappers (button, input, dialog, drawer, table, tabs, etc.).
These are foundational building blocks reused by all feature UIs.

---

## 7) `src/features/` (Feature-First Domain Modules)

Each feature generally follows this pattern:

- `api/`: frontend data hooks and mutations
- `components/`: feature-local UI
- `hooks/`: feature-local utility hooks
- `server/route.ts`: Hono server routes for this feature
- `schemas.ts`: Zod validation schemas
- `types.ts`: domain types
- `queries.ts` (when needed): server query helpers

### `auth/`
Authentication lifecycle: register, login, logout, current-user queries, auth forms, and auth API routes.

### `members/`
Workspace membership domain: list/update/delete members, roles/types, member utilities, and members API routes.

### `projects/`
Project CRUD + analytics hooks/components/server routes and project-specific utility hooks.

### `tasks/`
Task CRUD, filters, bulk updates, and multi-view UI (table/kanban/calendar) with corresponding server routes.

### `workspaces/`
Workspace CRUD, invite/join flow, analytics, workspace/member-related components, and server routes.

---

## 8) `src/hooks/`

Cross-feature custom hooks.
- `use-confirm.tsx`: reusable confirm-dialog promise hook.

---

## 9) `src/lib/`

Shared infrastructure layer:

- `appwrite.ts`: session/admin Appwrite clients
- `session-middleware.ts`: auth/session middleware for Hono routes
- `rpc.ts`: typed frontend RPC client for Hono endpoints
- `oauth.ts`: OAuth utilities
- `utils.ts`: general utilities (`cn`, helpers)

---

## 10) Runtime Interaction Map

1. Next.js route files render pages/layouts from `src/app`.
2. Feature hooks in `src/features/*/api` call the typed client in `src/lib/rpc.ts`.
3. Requests go to `src/app/api/[[...route]]/route.ts`.
4. Hono dispatches by route prefix (`/auth`, `/workspaces`, `/projects`, `/tasks`, `/members`).
5. Feature server routes execute Appwrite operations via middleware/clients in `src/lib`.

This separation keeps UI, domain logic, and infrastructure concerns cleanly partitioned and scalable.
