# Complete File Index

This index includes every current workspace file (excluding dependency/build folders such as `node_modules` and `.next`).

## Root

- .gitignore
- .env.local
- README.md
- components.json
- eslint.config.mjs
- next-env.d.ts
- next.config.ts
- package-lock.json
- package.json
- postcss.config.mjs
- tailwind.config.ts
- tsconfig.json

## Documentation (`docs/`)

- docs/manual/README.md
- docs/manual/architecture-and-structure.md
- docs/manual/file-index.md
- docs/manual/file-catalog-professional.md

## Public Assets (`public/`)

- public/file.svg
- public/globe.svg
- public/logo.png
- public/logo.svg
- public/next.svg
- public/vercel.svg
- public/window.svg

## App Router (`src/app/`)

- src/app/(auth)/layout.tsx
- src/app/(auth)/sign-in/page.tsx
- src/app/(auth)/sign-up/page.tsx
- src/app/(dashboard)/layout.tsx
- src/app/(dashboard)/page.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/client.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/page.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/client.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/page.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/tasks/[taskId]/client.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/tasks/[taskId]/page.tsx
- src/app/(dashboard)/workspaces/[workspaceId]/tasks/page.tsx
- src/app/(standalone)/layout.tsx
- src/app/(standalone)/workspaces/[workspaceId]/join/[inviteCode]/client.tsx
- src/app/(standalone)/workspaces/[workspaceId]/join/[inviteCode]/page.tsx
- src/app/(standalone)/workspaces/[workspaceId]/members/page.tsx
- src/app/(standalone)/workspaces/[workspaceId]/projects/[projectId]/settings/client.tsx
- src/app/(standalone)/workspaces/[workspaceId]/projects/[projectId]/settings/page.tsx
- src/app/(standalone)/workspaces/[workspaceId]/settings/client.tsx
- src/app/(standalone)/workspaces/[workspaceId]/settings/page.tsx
- src/app/(standalone)/workspaces/create/page.tsx
- src/app/api/[[...route]]/route.ts
- src/app/error.tsx
- src/app/favicon.ico
- src/app/fonts/GeistMonoVF.woff
- src/app/fonts/GeistVF.woff
- src/app/globals.css
- src/app/layout.tsx
- src/app/loading.tsx
- src/app/oauth/route.ts

## Shared Components (`src/components/`)

- src/components/analytics-card.tsx
- src/components/analytics.tsx
- src/components/date-picker.tsx
- src/components/dotted-separator.tsx
- src/components/mobile-sidebar.tsx
- src/components/navbar.tsx
- src/components/navigation.tsx
- src/components/page-error.tsx
- src/components/page-loader.tsx
- src/components/projects.tsx
- src/components/query-provider.tsx
- src/components/responsive-modal.tsx
- src/components/sidebar.tsx
- src/components/workspace-switcher.tsx

### UI Primitives (`src/components/ui/`)

- src/components/ui/avatar.tsx
- src/components/ui/badge.tsx
- src/components/ui/button.tsx
- src/components/ui/calendar.tsx
- src/components/ui/card.tsx
- src/components/ui/chart.tsx
- src/components/ui/checkbox.tsx
- src/components/ui/dialog.tsx
- src/components/ui/drawer.tsx
- src/components/ui/dropdown-menu.tsx
- src/components/ui/form.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/popover.tsx
- src/components/ui/scroll-area.tsx
- src/components/ui/select.tsx
- src/components/ui/separator.tsx
- src/components/ui/sheet.tsx
- src/components/ui/skeleton.tsx
- src/components/ui/sonner.tsx
- src/components/ui/table.tsx
- src/components/ui/tabs.tsx
- src/components/ui/textarea.tsx

## Config (`src/`)

- src/config.ts

## Feature Modules (`src/features/`)

### Auth

- src/features/auth/api/use-current.ts
- src/features/auth/api/use-login.ts
- src/features/auth/api/use-logout.ts
- src/features/auth/api/use-register.ts
- src/features/auth/components/sign-in-card.tsx
- src/features/auth/components/sign-up-card.tsx
- src/features/auth/components/user-button.tsx
- src/features/auth/constants.ts
- src/features/auth/queries.ts
- src/features/auth/schemas.ts
- src/features/auth/server/route.ts

### Members

- src/features/members/api/use-delete-member.ts
- src/features/members/api/use-get-members.ts
- src/features/members/api/use-update-member.ts
- src/features/members/components/member-avatar.tsx
- src/features/members/server/route.ts
- src/features/members/types.ts
- src/features/members/utils.ts

### Projects

- src/features/projects/api/use-create-project.ts
- src/features/projects/api/use-delete-project.ts
- src/features/projects/api/use-get-project-analytics.ts
- src/features/projects/api/use-get-project.ts
- src/features/projects/api/use-get-projects.ts
- src/features/projects/api/use-update-project.ts
- src/features/projects/components/create-project-form.tsx
- src/features/projects/components/create-project-modal.tsx
- src/features/projects/components/edit-project-form.tsx
- src/features/projects/components/project-avatar.tsx
- src/features/projects/hooks/use-create-project-modal.ts
- src/features/projects/hooks/use-project-id.ts
- src/features/projects/schemas.ts
- src/features/projects/server/route.ts
- src/features/projects/types.ts

### Tasks

- src/features/tasks/api/use-bulk-update-tasks.ts
- src/features/tasks/api/use-create-task.ts
- src/features/tasks/api/use-delete-task.ts
- src/features/tasks/api/use-get-task.ts
- src/features/tasks/api/use-get-tasks.ts
- src/features/tasks/api/use-update-task.ts
- src/features/tasks/components/columns.tsx
- src/features/tasks/components/create-task-form-wrapper.tsx
- src/features/tasks/components/create-task-form.tsx
- src/features/tasks/components/create-task-modal.tsx
- src/features/tasks/components/data-calendar.css
- src/features/tasks/components/data-calendar.tsx
- src/features/tasks/components/data-filters.tsx
- src/features/tasks/components/data-kanban.tsx
- src/features/tasks/components/data-table.tsx
- src/features/tasks/components/edit-task-form-wrapper.tsx
- src/features/tasks/components/edit-task-form.tsx
- src/features/tasks/components/edit-task-modal.tsx
- src/features/tasks/components/event-card.tsx
- src/features/tasks/components/kanban-card.tsx
- src/features/tasks/components/kanban-column-header.tsx
- src/features/tasks/components/overview-property.tsx
- src/features/tasks/components/task-actions.tsx
- src/features/tasks/components/task-breadcrumbs.tsx
- src/features/tasks/components/task-date.tsx
- src/features/tasks/components/task-description.tsx
- src/features/tasks/components/task-overview.tsx
- src/features/tasks/components/task-view-switcher.tsx
- src/features/tasks/hooks/use-create-task-modal.ts
- src/features/tasks/hooks/use-edit-task-modal.ts
- src/features/tasks/hooks/use-task-filters.ts
- src/features/tasks/hooks/use-task-id.ts
- src/features/tasks/schemas.ts
- src/features/tasks/server/route.ts
- src/features/tasks/types.ts

### Workspaces

- src/features/workspaces/api/use-create-workspace.ts
- src/features/workspaces/api/use-delete-workspace.ts
- src/features/workspaces/api/use-get-workspace-analytics.ts
- src/features/workspaces/api/use-get-workspace-info.ts
- src/features/workspaces/api/use-get-workspace.ts
- src/features/workspaces/api/use-get-workspaces.ts
- src/features/workspaces/api/use-join-workspace.ts
- src/features/workspaces/api/use-reset-invite-code.ts
- src/features/workspaces/api/use-update-workspace.ts
- src/features/workspaces/components/create-workspace-form.tsx
- src/features/workspaces/components/create-workspace-modal.tsx
- src/features/workspaces/components/edit-workspace-form.tsx
- src/features/workspaces/components/join-workspace-form.tsx
- src/features/workspaces/components/members-list.tsx
- src/features/workspaces/components/workspace-avatar.tsx
- src/features/workspaces/hooks/use-create-workspace-modal.ts
- src/features/workspaces/hooks/use-invite-code.ts
- src/features/workspaces/hooks/use-workspace-id.ts
- src/features/workspaces/queries.ts
- src/features/workspaces/schemas.ts
- src/features/workspaces/server/route.ts
- src/features/workspaces/types.ts

## Shared Hooks (`src/hooks/`)

- src/hooks/use-confirm.tsx

## Shared Libraries (`src/lib/`)

- src/lib/appwrite.ts
- src/lib/oauth.ts
- src/lib/rpc.ts
- src/lib/session-middleware.ts
- src/lib/utils.ts
