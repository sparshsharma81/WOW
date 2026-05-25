# WOW High Level Diagram

## Purpose
This diagram shows the end-to-end architecture of WOW: who uses it, how the frontend is structured, how requests flow through the API, and which backend services store or serve the data.

## High-Level Description
WOW is a layered business management platform with five main parts:

1. Users access the application through a browser.
2. The Next.js frontend renders authentication pages, the dashboard shell, workspace pages, and standalone settings pages.
3. Client actions are sent through typed hooks and the RPC client to the Hono API.
4. The Hono API validates requests, checks sessions, and routes traffic to feature-specific handlers.
5. Feature handlers communicate with Appwrite services for authentication, database documents, sessions, and storage.

## Detailed Component View

### 1. Users and Roles
- End User: Signs in, creates workspaces, manages projects, and tracks tasks.
- Workspace Admin: Manages membership, roles, invite codes, and workspace settings.
- Team Member: Participates in assigned workspaces and updates tasks according to access rights.

### 2. Frontend / Presentation Layer
- Browser: The entry point for all user interaction.
- Next.js App Router: Handles routes and layouts.
- Root Layout and Providers: Wrap the app with query state, notifications, and global structure.
- Auth Pages: Sign-in and sign-up screens.
- Dashboard Shell: Workspace landing page and authenticated app shell.
- Standalone Workspace Pages: Join, settings, member management, and project settings pages.
- Reusable UI Components: Buttons, cards, dialogs, tables, drawers, inputs, sidebars, and other shared building blocks.
- Query Provider / React Query: Manages cache, async state, and server synchronization.
- Typed RPC Client: Sends typed requests from the UI to the API.

### 3. API Layer
- Next API Catch-All Route: Receives all `/api/*` requests.
- Hono API Router: Central request router.
- Session Middleware: Loads current user/session context and enforces authentication.
- Validation Schemas: Zod schemas and request validators used to protect inputs.
- Feature Routers: Domain routers for auth, workspaces, projects, tasks, and members.
- OAuth Callback Route: Handles external authentication callback flows.

### 4. Domain Feature Modules
- Auth Feature: Sign in, sign up, logout, current user.
- Workspaces Feature: Create, join, update, reset invite code, analytics.
- Projects Feature: CRUD, project analytics, project settings.
- Tasks Feature: CRUD, filters, kanban/table/calendar views, bulk updates.
- Members Feature: List members, update roles, remove members.

### 5. Backend Services
- Appwrite Account Service: Creates and manages user sessions.
- Appwrite Users Service: Resolves user profile data.
- Appwrite Databases: Stores workspace, project, task, and member documents.
- Appwrite Storage: Stores uploaded images and avatars.
- Appwrite Session Store: Persists active authentication state.
- Workspace / Project / Task Documents: Core business records.
- Uploaded Images / Avatars: Visual assets used by workspaces and projects.

### 6. Cross-Cutting Concerns
- Environment Configuration: Appwrite IDs, URLs, and secrets.
- CORS Policy: Controls allowed origins for API requests.
- OAuth Provider Flow: Supports sign-in callback flows.
- Analytics UI / Charts: Displays workspace and project metrics.
- Calendar View: Shows tasks on a date-based timeline.
- Kanban View: Shows tasks as a drag-and-drop board.
- Table View: Shows tasks in a structured list.

## Text Diagram

```text
End User / Admin / Team Member
        |
        v
Browser
        |
        v
Next.js App Router
   |        |         |
   |        |         +--> Standalone Workspace Pages
   |        +-------------> Dashboard Shell
   +----------------------> Auth Pages
        |
        v
Reusable UI Components + Query Provider
        |
        v
Typed RPC Client
        |
        v
Next API Catch-All Route (/api/*)
        |
        v
Hono API Router
   |        |        |        |        |
   |        |        |        |        +--> Member Router
   |        |        |        +-----------> Task Router
   |        |        +--------------------> Project Router
   |        +-----------------------------> Workspace Router
   +-------------------------------------> Auth Router
        |
        v
Session Middleware + Zod Validation
        |
        v
Feature Server Handlers
        |
        v
Appwrite Services
   |        |        |        |
   |        |        |        +--> Storage
   |        |        +------------> Databases
   |        +---------------------> Users Service
   +------------------------------> Account / Sessions
```

## Mermaid Source

```mermaid
flowchart LR
  U1[End User]
  U2[Workspace Admin]
  U3[Team Member]

  subgraph C[Client / Presentation Layer]
    B[Browser]
    N1[Next.js App Router]
    L1[Root Layout + Providers]
    P1[Auth Pages]
    P2[Dashboard Shell]
    P3[Standalone Workspace Pages]
    UI[Reusable UI Components]
    QP[Query Provider / React Query]
    RPC[Typed RPC Client]
    B --> N1
    N1 --> L1
    N1 --> P1
    N1 --> P2
    N1 --> P3
    N1 --> UI
    N1 --> QP
    QP --> RPC
  end

  subgraph A[Application API Layer]
    NR[Next API Catch-All Route /api/[[...route]]]
    H[Hono API Router]
    SM[Session Middleware]
    VA[Validation Schemas / Zod]
    FB[Feature Routers]
    AUTH[Auth Router]
    WS[Workspace Router]
    PR[Project Router]
    TK[Task Router]
    MB[Member Router]
    OA[OAuth Callback Route]
    NR --> H
    H --> SM
    H --> VA
    H --> FB
    FB --> AUTH
    FB --> WS
    FB --> PR
    FB --> TK
    FB --> MB
    OA --> H
  end

  subgraph D[Domain Feature Modules]
    FA[Auth Feature\nSign in / Sign up / Logout / Current User]
    FW[Workspaces Feature\nCreate / Join / Update / Invite / Analytics]
    FP[Projects Feature\nCRUD / Analytics / Settings]
    FT[Tasks Feature\nCRUD / Filters / Kanban / Table / Calendar]
    FM[Members Feature\nList / Update Role / Remove]
  end

  subgraph S[Backend Services]
    AP[Appwrite Account Service]
    AU[Appwrite Users Service]
    DB[Appwrite Databases]
    ST[Appwrite Storage]
    SE[Appwrite Session Store]
    IDS[Workspace / Project / Task Documents]
    IMG[Uploaded Images / Avatars]
  end

  subgraph X[External / Cross-Cutting]
    ENV[Environment Configuration]
    CORS[CORS Policy]
    OAUTH[OAuth Provider Flow]
    AN[Analytics UI / Charts]
    CAL[Calendar View]
    KAN[Kanban View]
    TAB[Table View]
  end

  U1 --> B
  U2 --> B
  U3 --> B

  RPC --> NR
  P1 --> RPC
  P2 --> RPC
  P3 --> RPC
  UI --> RPC

  AUTH --> FA
  WS --> FW
  PR --> FP
  TK --> FT
  MB --> FM

  FA --> AP
  FA --> SE
  FW --> DB
  FW --> ST
  FW --> AU
  FW --> IDS
  FP --> DB
  FP --> ST
  FP --> IDS
  FT --> DB
  FT --> AU
  FT --> IDS
  FM --> DB
  FM --> AU
  FM --> IDS

  ENV -. config .-> N1
  ENV -. config .-> H
  CORS -. policy .-> H
  OAUTH -. callback .-> OA
  AN --- P2
  CAL --- FT
  KAN --- FT
  TAB --- FT

  DB --> IDS
  ST --> IMG
  AU --> FM
  SE --> FA
```

## How To Use This In Your Document
- Paste the Mermaid source into a Mermaid-enabled editor or renderer to generate an image.
- If your official document only accepts images, render the Mermaid diagram first and insert the exported PNG/SVG.
- If you need a plain-text version, use the text diagram section above.
