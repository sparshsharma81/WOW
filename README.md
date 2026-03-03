# WOW Project Documentation

Comprehensive technical documentation for the `my-app` workspace (Next.js + Hono + Appwrite).

## 1) Project Overview

WOW is a collaborative workspace/task management application with:

- Authentication (sign-in/sign-up/logout/current user)
- Workspace creation, membership, invites, analytics
- Project CRUD + project analytics
- Task CRUD, Kanban/Table/Calendar views, filters, bulk status/position updates
- Responsive dashboard and standalone settings/join flows

## 2) Stack

- **Framework:** Next.js App Router
- **API Layer:** Hono routed through `src/app/api/[[...route]]/route.ts`
- **Backend Service:** Appwrite (Auth, Databases, Storage)
- **State/Fetching:** TanStack Query
- **UI:** Radix primitives + custom UI wrappers + Tailwind CSS
- **Validation:** Zod + `@hono/zod-validator`
- **Utilities:** date-fns, react-hook-form, nuqs, recharts, react-big-calendar

## 3) Runbook

### Development

```bash
npm install
npm run dev
```

### Production Build Check

```bash
npm run build
npm run start
```

## 4) Environment Variables

Defined in `.env.local`:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_COLLECTION_ID` (workspace collection id)
- `NEXT_PUBLIC_APPWRITE_MEMBERS_ID`
- `NEXT_PUBLIC_APPWRITE_IMAGE_BUCKET_ID`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` / `NEXT_PUBLIC_APPWRITE_PROJECTS_ID` (projects collection id)
- `NEXT_PUBLIC_APPWRITE_TASKS_ID`
- `NEXT_APPWRITE_KEY`

---

## 5) Full File Catalog (Every File + Purpose)

### Root files

- `.env.local` — local runtime secrets and Appwrite configuration.
- `.gitignore` — git ignore rules for build artifacts, dependencies, local files.
- `components.json` — shadcn/ui component generator configuration.
- `eslint.config.mjs` — ESLint rules and linting configuration.
- `next-env.d.ts` — Next.js TypeScript ambient declarations.
- `next.config.ts` — Next.js runtime/build configuration.
- `package-lock.json` — exact npm dependency lockfile.
- `package.json` — scripts, dependencies, and project metadata.
- `postcss.config.mjs` — PostCSS plugin pipeline (Tailwind + autoprefixing).
- `README.md` — project documentation (this file).
- `tailwind.config.ts` — Tailwind theme/content configuration.
- `tsconfig.json` — TypeScript compiler configuration and path aliases.

### Public assets (`public/`)

- `public/file.svg` — static SVG asset.
- `public/globe.svg` — static SVG asset.
- `public/logo.png` — branded logo image asset.
- `public/logo.svg` — branded vector logo.
- `public/next.svg` — default Next.js icon asset.
- `public/vercel.svg` — default Vercel icon asset.
- `public/window.svg` — static SVG asset.

### Global config (`src/`)

- `src/config.ts` — central Appwrite IDs/constants used by server routes and queries.

### App Router (`src/app/`)

- `src/app/error.tsx` — global error boundary UI for app-level runtime errors.
- `src/app/favicon.ico` — browser favicon for the app.
- `src/app/globals.css` — global styles, CSS variables, Tailwind layers/utilities.
- `src/app/layout.tsx` — root layout, global providers/toaster, hydration safeguards.
- `src/app/loading.tsx` — root-level loading fallback.
- `src/app/(auth)/layout.tsx` — shared layout for auth pages.
- `src/app/(auth)/sign-in/page.tsx` — sign-in page route.
- `src/app/(auth)/sign-up/page.tsx` — sign-up page route.
- `src/app/(dashboard)/layout.tsx` — main authenticated dashboard shell (sidebar/navbar/modal mounts).
- `src/app/(dashboard)/page.tsx` — authenticated home redirect logic to workspace/create.
- `src/app/(dashboard)/workspaces/[workspaceId]/client.tsx` — workspace dashboard client UI (analytics/tasks/projects/members cards).
- `src/app/(dashboard)/workspaces/[workspaceId]/page.tsx` — workspace dashboard server wrapper/guard.
- `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/client.tsx` — project details client UI.
- `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/page.tsx` — project details server wrapper.
- `src/app/(dashboard)/workspaces/[workspaceId]/tasks/page.tsx` — workspace tasks listing/view page.
- `src/app/(dashboard)/workspaces/[workspaceId]/tasks/[taskId]/client.tsx` — task details client UI.
- `src/app/(dashboard)/workspaces/[workspaceId]/tasks/[taskId]/page.tsx` — task details server wrapper.
- `src/app/(standalone)/layout.tsx` — layout for standalone non-dashboard workspace flows.
- `src/app/(standalone)/workspaces/create/page.tsx` — workspace creation standalone page.
- `src/app/(standalone)/workspaces/[workspaceId]/join/[inviteCode]/client.tsx` — join workspace client flow.
- `src/app/(standalone)/workspaces/[workspaceId]/join/[inviteCode]/page.tsx` — join workspace server wrapper.
- `src/app/(standalone)/workspaces/[workspaceId]/members/page.tsx` — members management standalone page.
- `src/app/(standalone)/workspaces/[workspaceId]/projects/[projectId]/settings/client.tsx` — project settings client UI.
- `src/app/(standalone)/workspaces/[workspaceId]/projects/[projectId]/settings/page.tsx` — project settings server wrapper.
- `src/app/(standalone)/workspaces/[workspaceId]/settings/client.tsx` — workspace settings client UI.
- `src/app/(standalone)/workspaces/[workspaceId]/settings/page.tsx` — workspace settings server wrapper.
- `src/app/api/[[...route]]/route.ts` — Hono API entrypoint mounted under Next API catch-all route.
- `src/app/fonts/GeistMonoVF.woff` — Geist mono variable font.
- `src/app/fonts/GeistVF.woff` — Geist sans variable font.
- `src/app/oauth/route.ts` — OAuth callback/session establishment route.

### Shared components (`src/components/`)

- `src/components/analytics-card.tsx` — reusable metric card UI.
- `src/components/analytics.tsx` — analytics grid composition component.
- `src/components/date-picker.tsx` — reusable date picker component.
- `src/components/dotted-separator.tsx` — dotted separator visual component.
- `src/components/mobile-sidebar.tsx` — mobile sidebar container/toggle.
- `src/components/navbar.tsx` — top navigation bar component.
- `src/components/navigation.tsx` — navigation links/menu list.
- `src/components/page-error.tsx` — standardized page error state.
- `src/components/page-loader.tsx` — standardized page loading spinner/skeleton.
- `src/components/projects.tsx` — workspace project list teaser/sidebar module.
- `src/components/query-provider.tsx` — React Query + nuqs adapter provider.
- `src/components/responsive-modal.tsx` — desktop dialog/mobile drawer abstraction.
- `src/components/sidebar.tsx` — desktop sidebar layout.
- `src/components/workspace-switcher.tsx` — workspace select/switch UI.

### UI primitives (`src/components/ui/`)

- `src/components/ui/avatar.tsx` — avatar primitive wrapper.
- `src/components/ui/badge.tsx` — badge variants component.
- `src/components/ui/button.tsx` — button variants component.
- `src/components/ui/calendar.tsx` — day-picker based calendar component.
- `src/components/ui/card.tsx` — card primitive wrapper.
- `src/components/ui/chart.tsx` — chart container/util helpers.
- `src/components/ui/checkbox.tsx` — checkbox primitive wrapper.
- `src/components/ui/dialog.tsx` — dialog primitives/wrappers.
- `src/components/ui/drawer.tsx` — drawer primitives/wrappers.
- `src/components/ui/dropdown-menu.tsx` — dropdown menu primitives.
- `src/components/ui/form.tsx` — react-hook-form bindings and field helpers.
- `src/components/ui/input.tsx` — text input component.
- `src/components/ui/label.tsx` — label component.
- `src/components/ui/popover.tsx` — popover primitive wrapper.
- `src/components/ui/scroll-area.tsx` — scroll area primitive wrapper.
- `src/components/ui/select.tsx` — select primitive wrapper.
- `src/components/ui/separator.tsx` — separator primitive.
- `src/components/ui/sheet.tsx` — sheet/side-panel primitive.
- `src/components/ui/skeleton.tsx` — loading skeleton blocks.
- `src/components/ui/sonner.tsx` — toast UI wrapper.
- `src/components/ui/table.tsx` — table primitive wrappers.
- `src/components/ui/tabs.tsx` — tabs primitive wrappers.
- `src/components/ui/textarea.tsx` — textarea component.

### Feature: Auth (`src/features/auth/`)

- `src/features/auth/constants.ts` — auth-level constants (cookie names, etc.).
- `src/features/auth/queries.ts` — server-side auth query helpers.
- `src/features/auth/schemas.ts` — zod schemas for auth forms.
- `src/features/auth/api/use-current.ts` — query hook for current authenticated user.
- `src/features/auth/api/use-login.ts` — mutation hook for login.
- `src/features/auth/api/use-logout.ts` — mutation hook for logout.
- `src/features/auth/api/use-register.ts` — mutation hook for registration.
- `src/features/auth/components/sign-in-card.tsx` — sign-in form card UI.
- `src/features/auth/components/sign-up-card.tsx` — sign-up form card UI.
- `src/features/auth/components/user-button.tsx` — user/avatar menu actions.
- `src/features/auth/server/route.ts` — auth API endpoints (login/register/logout/current).

### Feature: Members (`src/features/members/`)

- `src/features/members/types.ts` — member domain types and roles.
- `src/features/members/utils.ts` — member lookup/authorization utilities.
- `src/features/members/api/use-delete-member.ts` — delete member mutation hook.
- `src/features/members/api/use-get-members.ts` — list members query hook.
- `src/features/members/api/use-update-member.ts` — update member role/details mutation hook.
- `src/features/members/components/member-avatar.tsx` — member avatar component.
- `src/features/members/server/route.ts` — members API routes.

### Feature: Projects (`src/features/projects/`)

- `src/features/projects/schemas.ts` — zod schemas for project create/update forms.
- `src/features/projects/types.ts` — project domain type definitions.
- `src/features/projects/api/use-create-project.ts` — create project mutation hook.
- `src/features/projects/api/use-delete-project.ts` — delete project mutation hook.
- `src/features/projects/api/use-get-project-analytics.ts` — project analytics query hook.
- `src/features/projects/api/use-get-project.ts` — single project query hook.
- `src/features/projects/api/use-get-projects.ts` — workspace project list query hook.
- `src/features/projects/api/use-update-project.ts` — project update mutation hook.
- `src/features/projects/components/create-project-form.tsx` — project creation form UI.
- `src/features/projects/components/create-project-modal.tsx` — project creation modal shell.
- `src/features/projects/components/edit-project-form.tsx` — project edit form UI.
- `src/features/projects/components/project-avatar.tsx` — project avatar/logo component.
- `src/features/projects/hooks/use-create-project-modal.ts` — query-string state hook for create-project modal.
- `src/features/projects/hooks/use-project-id.ts` — route param helper for `projectId`.
- `src/features/projects/server/route.ts` — projects API routes + project analytics endpoint.

### Feature: Tasks (`src/features/tasks/`)

- `src/features/tasks/schemas.ts` — zod schemas for task create/update payloads.
- `src/features/tasks/types.ts` — task statuses/types and populated relation shapes.
- `src/features/tasks/api/use-bulk-update-tasks.ts` — bulk update mutation for kanban reorder/status.
- `src/features/tasks/api/use-create-task.ts` — task create mutation hook.
- `src/features/tasks/api/use-delete-task.ts` — task delete mutation hook.
- `src/features/tasks/api/use-get-task.ts` — single task query hook.
- `src/features/tasks/api/use-get-tasks.ts` — tasks listing query hook with filters.
- `src/features/tasks/api/use-update-task.ts` — task update mutation hook.
- `src/features/tasks/components/columns.tsx` — table column definitions for task table view.
- `src/features/tasks/components/create-task-form-wrapper.tsx` — data-provider wrapper for create task form.
- `src/features/tasks/components/create-task-form.tsx` — create task form UI.
- `src/features/tasks/components/create-task-modal.tsx` — create task modal shell.
- `src/features/tasks/components/data-calendar.css` — react-big-calendar style overrides.
- `src/features/tasks/components/data-calendar.tsx` — calendar view of tasks.
- `src/features/tasks/components/data-filters.tsx` — task filter controls UI.
- `src/features/tasks/components/data-kanban.tsx` — kanban board task view.
- `src/features/tasks/components/data-table.tsx` — table task view.
- `src/features/tasks/components/edit-task-form-wrapper.tsx` — data-provider wrapper for edit task form.
- `src/features/tasks/components/edit-task-form.tsx` — edit task form UI.
- `src/features/tasks/components/edit-task-modal.tsx` — edit task modal shell.
- `src/features/tasks/components/event-card.tsx` — calendar event card renderer.
- `src/features/tasks/components/kanban-card.tsx` — single kanban task card UI.
- `src/features/tasks/components/kanban-column-header.tsx` — kanban status column header.
- `src/features/tasks/components/overview-property.tsx` — key/value row component for task overview.
- `src/features/tasks/components/task-actions.tsx` — per-task action menu.
- `src/features/tasks/components/task-breadcrumbs.tsx` — breadcrumbs for task detail pages.
- `src/features/tasks/components/task-date.tsx` — date formatting/status display component.
- `src/features/tasks/components/task-description.tsx` — task description panel component.
- `src/features/tasks/components/task-overview.tsx` — task overview card.
- `src/features/tasks/components/task-view-switcher.tsx` — table/kanban/calendar switcher.
- `src/features/tasks/hooks/use-create-task-modal.ts` — query-string state hook for create-task modal.
- `src/features/tasks/hooks/use-edit-task-modal.ts` — query-string state hook for edit-task modal.
- `src/features/tasks/hooks/use-task-filters.ts` — URL query filter-state hook for tasks.
- `src/features/tasks/hooks/use-task-id.ts` — route param helper for `taskId`.
- `src/features/tasks/server/route.ts` — tasks API routes (CRUD, list/population, bulk update).

### Feature: Workspaces (`src/features/workspaces/`)

- `src/features/workspaces/queries.ts` — server-side workspace query helpers.
- `src/features/workspaces/schemas.ts` — zod schemas for workspace forms.
- `src/features/workspaces/types.ts` — workspace domain type definitions.
- `src/features/workspaces/api/use-create-workspace.ts` — workspace create mutation hook.
- `src/features/workspaces/api/use-delete-workspace.ts` — workspace delete mutation hook.
- `src/features/workspaces/api/use-get-workspace-analytics.ts` — workspace analytics query hook.
- `src/features/workspaces/api/use-get-workspace-info.ts` — workspace info query hook.
- `src/features/workspaces/api/use-get-workspace.ts` — single workspace query hook.
- `src/features/workspaces/api/use-get-workspaces.ts` — list workspaces query hook.
- `src/features/workspaces/api/use-join-workspace.ts` — join workspace mutation hook.
- `src/features/workspaces/api/use-reset-invite-code.ts` — invite reset mutation hook.
- `src/features/workspaces/api/use-update-workspace.ts` — workspace update mutation hook.
- `src/features/workspaces/components/create-workspace-form.tsx` — create workspace form UI.
- `src/features/workspaces/components/create-workspace-modal.tsx` — create workspace modal shell.
- `src/features/workspaces/components/edit-workspace-form.tsx` — edit workspace form UI.
- `src/features/workspaces/components/join-workspace-form.tsx` — workspace invite join UI.
- `src/features/workspaces/components/members-list.tsx` — workspace members list UI.
- `src/features/workspaces/components/workspace-avatar.tsx` — workspace avatar/logo component.
- `src/features/workspaces/hooks/use-create-workspace-modal.ts` — query-string state for create workspace modal.
- `src/features/workspaces/hooks/use-invite-code.ts` — route param helper for invite code.
- `src/features/workspaces/hooks/use-workspace-id.ts` — route param helper for workspace id.
- `src/features/workspaces/server/route.ts` — workspaces API routes (CRUD, invite, analytics).

### Shared hooks (`src/hooks/`)

- `src/hooks/use-confirm.tsx` — generic confirmation modal hook returning dialog renderer + promise API.

### Core libraries (`src/lib/`)

- `src/lib/appwrite.ts` — Appwrite client factories for session/admin contexts.
- `src/lib/oauth.ts` — OAuth helper actions and redirects.
- `src/lib/rpc.ts` — typed Hono RPC client for frontend API calls.
- `src/lib/session-middleware.ts` — Hono middleware for session auth/context injection.
- `src/lib/utils.ts` — shared utility helpers (`cn`, text casing, invite code helpers, etc.).

---

## 6) Architectural Notes

1. **Frontend API calls** use hooks under `src/features/**/api/*` via RPC client (`src/lib/rpc.ts`).
2. **Backend endpoints** are feature-local Hono routers under `src/features/**/server/route.ts`.
3. **Route mounting** happens centrally in `src/app/api/[[...route]]/route.ts`.
4. **Appwrite IDs** should be maintained in `.env.local` and consumed via `src/config.ts`.
5. **Domain ownership** is feature-oriented (`auth`, `workspaces`, `projects`, `tasks`, `members`).

## 7) Maintenance Guidance

- Add new files to the relevant feature folder and update this README catalog.
- Keep API hooks (`api/*`) and backend routes (`server/route.ts`) consistent for payload shape.
- Validate schema changes in Appwrite and mirror field names in server query/create/update code.
- Run `npm run build` before merging to catch typing/runtime integration issues early.
 
