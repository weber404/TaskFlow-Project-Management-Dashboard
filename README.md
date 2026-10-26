<div align="center">

  <img src="./public/icon.svg" alt="TaskFlow Emblem" width="80" height="80" />

  # TaskFlow
  ### Project & Task Management Dashboard

  **Plan clearly. Track progress. Ship together.**

  A modern, high-performance project and task management dashboard built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and Prisma 7 ORM backed by hosted PostgreSQL on Neon. Crafted with an Apple-inspired dark aesthetic, strict schema validations, relational data integrity, and comprehensive automated test coverage.

  <p align="center">
    <a href="#overview">Overview</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#ui--design-system">Design System</a> •
    <a href="#system-architecture">Architecture</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#automated-testing">Testing</a> •
    <a href="#engineering-challenges--solutions">Challenges</a> •
    <a href="#ai-usage--code-validation">AI Disclosure</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.4-111111?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 7" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon_Hosted-00E599?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon PostgreSQL" />
    <img src="https://img.shields.io/badge/Vitest-123_Passed-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest 123 Passed" />
    <img src="https://img.shields.io/badge/Zod-Strict_Schemas-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod Validated" />
  </p>

</div>

---

## Overview

Modern engineering teams often get bogged down by cluttered, overly complicated issue trackers. **TaskFlow** is engineered as a fast, focused, and intuitive project management dashboard designed to make planning and task execution effortless.

TaskFlow provides a cohesive operational cockpit where product managers and engineers can organize multi-stage initiatives, manage linked action items, track approaching deadlines, and monitor project completion progress — all wrapped in an Apple-inspired dark interface with clean visual feedback and zero distraction.

### Live Demo & Submission Details

> [!NOTE]
> **Deployment Status:** Pre-submission build. Deployment configuration is prepared for Vercel with Neon Serverless PostgreSQL.
> - **Live Application URL:** `[Deployment Pending Submission Review — Add URL Here]`
> - **GitHub Repository:** `[Repository Staged on branch main — Add GitHub Remote URL Here]`

---

## Key Features

TaskFlow delivers a complete, relational CRUD workflow across projects and tasks:

### 1. Analytics & Overview Dashboard (`/`)
- **Metric Cards:** Aggregated metrics from PostgreSQL computing **Total Projects**, **Active Projects**, **Completed Tasks**, and **Pending Tasks**, with completion percentages and overdue counts calculated dynamically on each page load or manual refresh.
- **Completion Metrics:** Metric indicators display the exact count and percentage of completed vs. pending tasks, complemented by visual progress bars on project cards and the project detail view.
- **Recent Projects List:** Dedicated vertical list presenting the 5 most recently updated initiatives with title links, status badges, formatted deadlines, and task counts.
- **Recent Tasks Action List:** Quick-access list displaying associated projects, status badges, and an **inline status toggle** to rapidly progress tasks from the dashboard.
- **HTTP Fetch & Manual Refresh:** Dashboard telemetry is queried via standard HTTP API requests upon initial page mount, with a dedicated "Refresh Data" button allowing users to re-query the database on demand (no WebSockets or background polling).

### 2. Comprehensive Projects Management (`/projects`)
- **Responsive Card Grid:** Clean visual cards presenting project titles, descriptions, due dates, task tallies, and progress indicators.
- **Status Filtering:** Filter seamlessly between `All`, `Active`, `Completed`, and `On Hold`.
- **Overdue Detection:** Visual alert indicators highlighting projects whose deadline has lapsed while still incomplete.
- **Project Lifecycle Operations:**
  - **Create Project Modal:** Full input validation for title, optional description, initial status, and calendar deadline.
  - **Edit Project Modal:** In-place modification of project scope, deadline, and status.
  - **Delete Project Modal:** Safe deletion modal featuring explicit warnings regarding cascading task deletion.

### 3. Dedicated Project Detail View (`/projects/[id]`)
- **Focused Workspace:** Dedicated page displaying project metadata, completion bar, and linked action items.
- **Pre-linked Task Creation:** Instantly add new tasks directly tied to the current project without needing manual project selection.
- **Relational Integrity:** View all tasks grouped under the initiative, with quick edit, delete, and status progression controls.

### 4. Tasks Management & Filtering (`/tasks`)
- **Unified Task List:** Centralized view across all tasks in the database.
- **Dual-Axis Filtering:**
  - **By Status:** Filter by `All`, `Pending`, `In Progress`, or `Completed`.
  - **By Project:** Scope tasks to a specific project or display all initiatives simultaneously.
- **Rapid Status Progression:** Dedicated one-click button to cycle task states: `PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.
- **Create & Edit Modals:** Full modal forms with project dropdown selector and input sanitization.

### 5. Verified Data Enums
TaskFlow strictly enforces domain enums across the database, API layer, and client components:
- **Project Status:**
  - `ACTIVE`: Active project in development.
  - `COMPLETED`: Successfully delivered project.
  - `ON_HOLD`: Temporarily paused or blocked initiative.
- **Task Status:**
  - `PENDING`: Action item queued and awaiting start.
  - `IN_PROGRESS`: Actively being worked on.
  - `COMPLETED`: Finished action item.

---

## UI & Design System

TaskFlow features an **Apple-inspired dark visual identity** created specifically for focused productivity:

| Token / Element | Value / Implementation | Design Purpose |
| :--- | :--- | :--- |
| **Root Background** | `#111111` | Deep dark charcoal canvas preventing eye strain |
| **Surface Cards** | `#1C1C1C` | Crisp, elevated card panels with `#343434` subtle borders |
| **Elevated Surfaces** | `#242424` / `#2B2B2B` | Modals, dropdowns, and interactive hover states |
| **Primary Accent** | `#72C7BE` (Muted Teal) | High-contrast, non-glare action highlights |
| **Status Accents** | `#72C7A5` (Success) • `#E5BE72` (Warning) • `#EF7777` (Danger) • `#82B8E8` (Info) | Harmonious semantic badges with subtle translucent backdrops |
| **Typography** | Native Apple System Font Stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"`) | Crisp rendering, optical kerning, and native platform feel |
| **Button Alignment** | `.button-content` Flexbox utility (`flex-row items-center whitespace-nowrap`) | Prevents icon-text wrapping on narrow screens and mobile viewports |
| **Button Contrast** | Dark `#111111` typography on solid `#72C7BE` teal buttons | Exceeds WCAG AAA contrast standard (9.47:1 ratio, well above 7:1) |
| **Body & Muted Contrast** | Primary text `#F5F5F5` and secondary `#B5B5B5` on `#111111` | Meets WCAG AA contrast standards (secondary text ~5.26:1, above 4.5:1) |

### Application Screenshots

> [!TIP]
> **Visual Showcase:**
> Real screenshots captured from the running application can be placed in `public/screenshots/` and referenced here upon deployment:
> - `public/screenshots/dashboard.png` — Main operational metrics and recent activity feeds.
> - `public/screenshots/projects.png` — Project card grid with active filters and overdue badges.
> - `public/screenshots/tasks.png` — Multi-filtered task management board with inline status controls.
> - `public/screenshots/modal.png` — Apple-styled modal dialogs with client-side Zod validation.

---

## System Architecture

TaskFlow uses Next.js 16 App Router architecture, connecting React 19 Client and Server Components to Neon Serverless PostgreSQL through Prisma 7:

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (Client & Server Components)"]
        UI["App Router Pages\n(/, /projects, /projects/:id, /tasks)"]
        Modals["Interactive Modals\n(Create, Edit, Delete)"]
        Forms["Zod Form Validation\n(Client-side feedback)"]
    end

    subgraph API["Backend API Layer (Next.js Route Handlers)"]
        Routes["API Endpoints\n(/api/projects, /api/tasks, /api/dashboard/stats)"]
        ZodServer["Zod Schema Engine\n(Input sanitization & strict validation)"]
        Envelope["Standardized JSON Envelope\n({ success, data, error })"]
    end

    subgraph Data["Database & ORM Layer"]
        PrismaORM["Prisma 7 Client\n(Generated Typed Models)"]
        Adapter["@prisma/adapter-pg\n(Native PostgreSQL Driver Adapter)"]
        NeonDB[("Neon Hosted PostgreSQL\n(Round-base / production branch)")]
    end

    UI --> Forms
    Forms --> Modals
    Modals -->|Fetch / JSON| Routes
    UI -->|Fetch / JSON| Routes
    Routes --> ZodServer
    ZodServer --> Envelope
    Routes --> PrismaORM
    PrismaORM --> Adapter
    Adapter -->|SSL Encrypted Pool| NeonDB
    NeonDB -->|Relational Data| Adapter
    Adapter --> PrismaORM
    PrismaORM --> Envelope
    Envelope -->|Typed JSON Response| UI
```

### Technology Justifications

- **Next.js 16 (App Router):** Unified full-stack framework providing route handlers, optimized static layouts, fast server-side data fetching, and zero-config deployment.
- **React 19:** Leveraging the latest React primitive optimizations, clean component hooks, and predictable state hydration.
- **TypeScript 5 (Strict Mode):** End-to-end type safety from database models to API response envelopes and UI props.
- **Tailwind CSS 4:** Modern CSS engine utilizing inline design tokens (`@theme inline`), CSS variables, and zero runtime styling overhead.
- **Prisma 7 (`@prisma/adapter-pg`):** Modern TypeScript client generation (`output = "./generated"`), automated migrations, and high-performance connection pooling tailored for serverless PostgreSQL.
- **Neon Hosted PostgreSQL:** Cloud-native, autoscaling PostgreSQL database providing robust relational integrity, foreign key constraints, and instant branch environments.
- **Zod 3:** Strict runtime validation schemas for both client forms and server endpoints, preventing invalid or malicious payloads from reaching the database.
- **Vitest 3:** Ultra-fast test runner with native ESM and TypeScript support, executing component tests in JSDOM alongside live integration suites.

---

## API Reference

All API routes follow a standardized JSON response envelope:

- **Success Response:** `{ "success": true, "data": <T> }`
- **Error Response:** `{ "success": false, "error": { "message": string, "issues"?: Array<{ path: string[], message: string }> } }`

### Endpoints Table

| Method | Endpoint | Description | Status Codes | Query Parameters / Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Computes aggregate counts, overdue initiatives, and completion rates | `200`, `500` | None |
| `GET` | `/api/projects` | Lists projects with attached task count (`_count.tasks`) | `200`, `400`, `500` | `?status=ACTIVE\|COMPLETED\|ON_HOLD` |
| `POST` | `/api/projects` | Creates a new project in PostgreSQL | `201`, `400`, `500` | Body: `{ title, description?, status?, deadline? }` |
| `GET` | `/api/projects/[id]` | Retrieves a project with all attached tasks ordered by ID | `200`, `400`, `404`, `500` | Path: `id` (integer) |
| `PATCH` | `/api/projects/[id]` | Partially updates permitted fields on an existing project | `200`, `400`, `404`, `500` | Body: `{ title?, description?, status?, deadline? }` |
| `DELETE` | `/api/projects/[id]` | Deletes a project and **cascades deletion** to all associated tasks | `200`, `400`, `404`, `500` | Path: `id` (integer) |
| `GET` | `/api/tasks` | Lists tasks with attached project metadata (`id`, `title`, `status`) | `200`, `400`, `500` | `?status=...&projectId=...` |
| `POST` | `/api/tasks` | Creates a new task after verifying parent project exists | `201`, `400`, `404`, `500` | Body: `{ projectId, title, description?, status? }` |
| `GET` | `/api/tasks/[id]` | Retrieves single task details with attached project information | `200`, `400`, `404`, `500` | Path: `id` (integer) |
| `PATCH` | `/api/tasks/[id]` | Updates task fields; validates new `projectId` if moved | `200`, `400`, `404`, `500` | Body: `{ title?, description?, status?, projectId? }` |
| `DELETE` | `/api/tasks/[id]` | Deletes a single task record | `200`, `400`, `404`, `500` | Path: `id` (integer) |

### Sample Request & Response

#### 1. Create a Project (`POST /api/projects`)

**Request:**
```http
POST /api/projects HTTP/1.1
Content-Type: application/json

{
  "title": "Mobile App Redesign",
  "description": "Refine the iOS and Android application experience.",
  "status": "ACTIVE",
  "deadline": "2026-12-01T00:00:00.000Z"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "title": "Mobile App Redesign",
    "description": "Refine the iOS and Android application experience.",
    "status": "ACTIVE",
    "deadline": "2026-12-01T00:00:00.000Z",
    "createdAt": "2026-10-26T14:00:00.000Z",
    "updatedAt": "2026-10-26T14:00:00.000Z",
    "_count": {
      "tasks": 0
    }
  }
}
```

#### 2. Validation Error Handling (`POST /api/tasks`)

**Invalid Request (empty title and non-existent project):**
```http
POST /api/tasks HTTP/1.1
Content-Type: application/json

{
  "projectId": 99999,
  "title": ""
}
```

**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "issues": [
      {
        "path": ["title"],
        "message": "Title cannot be empty"
      }
    ]
  }
}
```

---

## Database & Seed Schema

TaskFlow is backed by a normalized PostgreSQL database schema managed through Prisma 7:

```prisma
enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model Project {
  id          Int           @id @default(autoincrement())
  title       String
  description String?
  status      ProjectStatus @default(ACTIVE)
  deadline    DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tasks       Task[]

  @@index([status])
}

model Task {
  id          Int        @id @default(autoincrement())
  projectId   Int
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([projectId])
  @@index([status])
}
```

### Idempotent Seed Dataset
The repository includes a verified initial seed dataset in `prisma/seed-data.json` containing **10 projects** and **20 tasks**:
- **Projects (10 total):** 6 Active, 2 Completed, 2 On Hold.
- **Tasks (20 total):** 6 Completed, 5 In Progress, 9 Pending.
- **Sequence Synchronization:** The seed script (`prisma/seed.ts`) executes `setval()` on PostgreSQL serial sequences (`Project_id_seq` and `Task_id_seq`) after upserting explicit IDs, preventing primary key collisions on subsequent user inserts.

---

## Getting Started

Follow these steps to run TaskFlow locally from a fresh clone.

### Prerequisites
- **Node.js:** `v20.x` or higher
- **Package Manager:** `npm v10.x` or higher
- **PostgreSQL Database:** A hosted PostgreSQL instance (e.g., [Neon](https://neon.tech/)) or a local PostgreSQL 15+ database.

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "TaskFlow-Project Management Dashboard"

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your PostgreSQL connection string:
```env
# Neon Hosted PostgreSQL Database Connection URL
# Format: postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/neondb?sslmode=require"

# Optional: Unpooled connection URL for direct migration access
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST:5432/neondb?sslmode=require"

# Optional: Base application URL (defaults to localhost:3000)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> [!WARNING]
> Never commit `.env` or `.env.local` files to version control. Keep credentials safe.

### 3. Initialize Database & Prisma Client
```bash
# Validate Prisma schema
npm run db:validate

# Generate Prisma 7 TypeScript client models
npm run db:generate

# Apply database migrations to PostgreSQL
npm run db:migrate -- --name init

# (Optional) Seed the database with the initial 10 projects and 20 tasks
npm run db:seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Other Useful Scripts
```bash
# Run TypeScript type check
npm run typecheck

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start

# Launch Prisma Studio GUI
npm run db:studio
```

---

## Automated Testing

TaskFlow features a comprehensive automated testing suite built with **Vitest 3**, **React Testing Library**, and **JSDOM**.

```bash
# Run all automated tests
npm test

# Run tests with code coverage analysis
npm run test:coverage
```

### Test Suite Breakdown

| Suite Category | Files | Verified Tests | Focus Areas |
| :--- | :---: | :---: | :--- |
| **Component Tests** | 5 | 55 passed | Dashboard metrics, layout sidebar/header, projects grid, tasks list, and workflow mutation modals |
| **Integration API Tests** | 4 | 41 passed | Project CRUD, Task CRUD, Dashboard aggregation route handlers, and error interception |
| **Unit & Schema Tests** | 3 | 27 passed | Zod input schemas, API response helpers, and seed dataset relational integrity |
| **Live Database Tests** | 1 | 2 skipped (opt-in) | Safe query execution on live PostgreSQL when opted in |
| **Total Test Suite** | **12 files** | **123 passed / 2 skipped** | **Comprehensive end-to-end unit and integration coverage** |

### Enabling Live Database Tests
By default, tests run in safe mock isolation to prevent modifying live database records. To run live queries against your configured database:
```bash
RUN_LIVE_DB_TESTS=true npm test
```

---

## Engineering Challenges & Solutions

During the design and implementation of TaskFlow, several non-trivial engineering challenges were encountered and resolved:

### 1. Prisma 7 TypeScript Generator & Driver Adapter Migration
- **Challenge:** Prisma 7 introduced modern TypeScript client generation (`provider = "prisma-client"`) outputting directly to `./generated` rather than `node_modules/@prisma/client`, and decoupled database drivers into `@prisma/adapter-pg`.
- **Solution:** Configured `prisma.config.ts` and `src/lib/db.ts` to instantiate a global singleton utilizing `@prisma/adapter-pg`. Added a safe mock fallback connection string during build time to enable static compilation (`next build`) without failing when environment variables are not pre-injected.

### 2. PostgreSQL Serial Sequence Desynchronization After Seeding
- **Challenge:** Seeding explicit IDs (`id: 1..10` and `id: 1..20`) bypasses PostgreSQL's internal auto-incrementing sequence counter. Subsequent `INSERT` operations through the UI crashed due to duplicate primary key errors.
- **Solution:** Embedded an atomic sequence synchronization step inside `prisma/seed.ts` that executes `SELECT setval(pg_get_serial_sequence('"Project"', 'id'), coalesce(max(id), 1))` for both tables immediately following data upserts.

### 3. Cascading Deletions & Metric Consistency
- **Challenge:** Deleting a project without cleaning up tasks could cause orphan records or violate foreign key constraints. Additionally, dashboard metrics could become stale or miscalculate completion metrics.
- **Solution:** Implemented `onDelete: Cascade` at the Prisma relational schema level. Verified via integration tests that deleting a project automatically purges all linked tasks and adjusts global completion rate calculations dynamically.

### 4. Apple-Inspired Typography, Spacing & Horizontal Button Alignment
- **Challenge:** On responsive viewports and narrow cards, flex buttons containing leading SVG icons and text labels were prone to awkward wrapping, causing the icon to separate from its label.
- **Solution:** Engineered a dedicated `.button-content` flex utility with `flex-direction: row`, `align-items: center`, `gap: 0.5rem`, `white-space: nowrap`, and `shrink-0` applied to SVGs, guaranteeing rock-solid horizontal alignment across all breakpoints.

### 5. Strict Secret Isolation Before Version Control
- **Challenge:** Connecting Neon PostgreSQL generates local environment configurations that must never be exposed or committed to public version control.
- **Solution:** Created a pre-commit security audit workflow, ensuring `.gitignore` ignores all `.env*` files except `.env.example`, isolating active Neon credentials in `.env.local` while maintaining trackable, dummy-filled templates for collaborators.

---

## AI Usage & Code Validation

In accordance with open engineering standards, this project utilized AI-assisted pair programming during development:

- **AI Tools Used:** Google DeepMind Antigravity AI coding assistant.
- **Areas of Assistance:**
  - Scaffolding repetitive boilerplate for CRUD API route handlers and Zod validation schemas.
  - Generating initial test scenarios across component, integration, and seed integrity suites.
  - Prototyping Apple-inspired dark mode CSS tokens and SVG brand marks.
- **Review & Verification Process:**
  - Architectural patterns, relational schemas, and business logic were verified through a combination of focused code review and comprehensive automated testing.
  - Automated quality gates were executed before every milestone:
    - **Linting:** `npm run lint` (0 ESLint errors).
    - **Type Checking:** `npm run typecheck` (0 TypeScript errors).
    - **Automated Tests:** `npm test` (123 passing Vitest tests).
    - **Production Build:** `npm run build` (Clean Next.js output bundle).
    - **Pre-commit Audit:** Automated regex scanning verifying zero hardcoded credentials or connection strings.

---

## Deployment & Submission

### Deployment Blueprint (Vercel + Neon)
TaskFlow is optimized for zero-config deployment on Vercel backed by Neon PostgreSQL:

1. **Push to GitHub:** Push the verified repository to your GitHub account.
2. **Import to Vercel:** Connect the repository in the Vercel dashboard.
3. **Configure Environment Variables:** Add `DATABASE_URL` in the Vercel Project Settings using your pooled Neon connection string.
4. **Deploy:** Vercel automatically runs `next build` and deploys the serverless application.

### Submission Links

| Deliverable | URL / Status |
| :--- | :--- |
| **Live Deployed Application** | `[Deployment Pending Submission Review — Add URL Here]` |
| **GitHub Source Code Repository** | `[Repository Staged on branch main — Add GitHub Remote URL Here]` |

---

## Project Structure

```text
TaskFlow-Project Management Dashboard/
├── .env.example               # Safe environment configuration template
├── .gitignore                 # Strict ignore rules (.env, .neon, node_modules)
├── README.md                  # Comprehensive project documentation
├── eslint.config.mjs          # ESLint configuration
├── neon.ts                    # Neon project and branch configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and npm scripts
├── prisma.config.ts           # Prisma 7 configuration file
├── tsconfig.json              # TypeScript strict configuration
├── vitest.config.ts           # Vitest test runner configuration
│
├── prisma/
│   ├── generated/             # Generated Prisma 7 TypeScript client
│   ├── schema.prisma          # PostgreSQL relational schema
│   ├── seed-data.json         # Canonical 10 projects and 20 tasks dataset
│   └── seed.ts                # Idempotent database seeder with sequence sync
│
├── public/
│   ├── apple-icon.png         # iOS Apple touch icon
│   ├── favicon.ico            # Multi-resolution favicon
│   └── icon.svg               # Vector TaskFlow emblem
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # App Router dashboard route group
│   │   │   ├── layout.tsx     # Dashboard shell (Sidebar + Header)
│   │   │   ├── page.tsx       # Home dashboard overview (/)
│   │   │   ├── projects/      # Projects list (/projects) & details (/[id])
│   │   │   └── tasks/         # Tasks management view (/tasks)
│   │   ├── api/               # REST API route handlers
│   │   │   ├── dashboard/     # /api/dashboard/stats
│   │   │   ├── projects/      # /api/projects & /api/projects/[id]
│   │   │   └── tasks/         # /api/tasks & /api/tasks/[id]
│   │   ├── globals.css        # Apple dark tokens & Tailwind CSS 4 theme
│   │   └── layout.tsx         # Root HTML layout with custom metadata
│   │
│   ├── components/
│   │   ├── dashboard/         # Metric cards, recent activity components
│   │   ├── layout/            # Sidebar navigation, Header
│   │   ├── projects/          # Project list, card, detail view, modals
│   │   ├── tasks/             # Task list, task card, modals
│   │   └── ui/                # Reusable primitives (Button, Modal, Badge, Input)
│   │
│   ├── lib/
│   │   ├── api-response.ts    # Standardized response envelopes & error handlers
│   │   ├── db.ts              # PrismaClient singleton with @prisma/adapter-pg
│   │   └── utils.ts           # Date formatting and CSS class helpers
│   │
│   ├── schemas/               # Zod validation schemas
│   │   ├── project.schema.ts  # Project create, update, query schemas
│   │   └── task.schema.ts     # Task create, update, query schemas
│   │
│   └── types/                 # Shared TypeScript interfaces & domain enums
│
└── tests/
    ├── components/            # UI component & user interaction tests
    ├── integration/           # REST API & live database integration tests
    └── unit/                  # Schema validation & seed integrity tests
```

---

## Future Roadmap

Planned enhancements for future iterations:
- [ ] **Interactive Kanban View:** Drag-and-drop task workflow columns (Pending $\rightarrow$ In Progress $\rightarrow$ Completed).
- [ ] **Team Collaboration & Auth:** User accounts, project ownership, and multi-member team assignments.
- [ ] **Activity Audit Log:** Event logging tracking timeline changes for task status and project edits.
- [ ] **Export & Reporting:** Export project milestone summaries and task lists to CSV and PDF formats.

---

## License

This project is licensed under the [MIT License](LICENSE) — free for use in personal, educational, and commercial portfolios.
