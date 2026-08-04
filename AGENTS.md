# Agent Instructions

This file provides guidance to coding agents like Claude Code (claude.ai/code) and OpenCode when working with code in this repository.

## Git Workflow

**Always commit and push changes after completing a task.** Follow these rules:

1. After making code changes, always commit with a descriptive message
2. Push commits to the current feature branch
3. **NEVER push directly to `main` or `test` branches** - always use feature branches and PRs
4. Before pushing, verify the current branch is not `main` or `test`
5. **Open PRs against `main`** (the `test` branch is retired as a PR target; never target it)
6. After pushing, check if a PR exists for the branch. If not, create one with `gh pr create --base main`
7. **After creating a PR, always wait for explicit user approval before merging.** Never merge PRs autonomously.

### Starting a New Task

Branch from the latest `main`:

```bash
git checkout main && git pull origin main && git checkout -b <branch-name>
```

## Build Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Dev server with Turbopack
pnpm build          # Production build (uses webpack)
pnpm lint           # Run linter
pnpm format         # Run prettier + lint
pnpm update-types   # Regenerate Supabase types
```

## Architecture

- **Next.js 16** with App Router, React 19
- `app/` - Pages and API routes
- `components/` - React UI components (shadcn/ui + Radix primitives)
- `hooks/` - React hooks for data fetching and state
- `lib/` - Core business logic organized by domain:
  - `lib/ai/` - AI/LLM integrations
  - `lib/chat/` - Chat message handling
  - `lib/supabase/` - Database operations
  - `lib/tools/` - AI tool definitions
  - `lib/browser/` - Stagehand browser automation
  - `lib/stripe/` - Payment processing
- `providers/` - React context providers
- `types/` - TypeScript type definitions

## Key Technologies

- **AI**: Vercel AI SDK (`ai` package), Anthropic, OpenAI, Google Gemini
- **MCP**: Tools provided by recoup-api MCP server (send_email, etc.)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Privy
- **Payments**: Stripe
- **Browser Automation**: Stagehand (Playwright + AI)
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI

## Code Principles (from principles.md)

- **DRY**: Extract shared logic into reusable utilities
- **YAGNI**: You Aren't Gonna Need It - don't build for hypothetical future needs; delete unused files/code that are not imported
- **KISS**: Keep It Simple, Stupid - prefer simple solutions over clever ones
- **OCP**: Open/Closed Principle - open for extension, closed for modification
- **Single Responsibility**: One function per file, clear naming
- **No Production Logging**: Remove console.log before merging
- **File Organization**: Domain-specific directories (e.g., `/lib/fal/` not `/lib/utils/fal.ts`)
- **Security First**: Use battle-tested libraries (Streamdown, shadcn) over custom implementations
- **Comments**: Explain 'why', not 'what'; prefer self-documenting code

## Component Standards

- Use `@radix-ui/react-*` primitives with `class-variance-authority` (CVA)
- Use `cn()` utility for class merging
- Always include accessibility: semantic HTML, ARIA, keyboard navigation

## MCP Tools

Tools like `send_email` are now provided by the recoup-api MCP server, not defined locally. Tool chains in `lib/chat/toolChains/` reference tool names that MCP provides.

## Constants (`lib/consts.ts`)

Shared constants including:
- `RECOUP_FROM_EMAIL` - Default email sender address
- Platform-specific configurations

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
