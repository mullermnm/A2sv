---
trigger: manual
---

🧩 General Principles

Always prioritize clarity, modularity, and reusability over shortcuts.

Follow DRY, SOLID, and KISS principles in every part of the code.

Never hardcode sensitive or environment-dependent values — use .env with dotenv.

Always document with clear comments and a well-structured README.

⚙️ Architecture

Follow a layered architecture:

controller → service → repository → model → database


Each layer must be independent — the controller never directly touches the model or DB.

All shared utilities (e.g., Multer, error responses, Redis, types) live in the helpers folder 

Use a base class pattern:

BaseRepo for DB operations

BaseService for logic and transactions

BaseController for consistent response and error handling

🧱 TypeScript Standards

All types/interfaces must be centralized under src/types/:

src/types/
  ┣ index.ts
  ┣ models/
  ┣ requests/
  ┣ responses/


Use generic types in base classes and services (e.g., BaseRepo<T>).

Never duplicate types — re-export and import from the central types/ directory.

Prefer interfaces for data contracts and types for unions and primitives.

🧰 Reusability & Helpers

The multer configuration should exist once in helpers/multer.ts and be reusable for any route needing uploads.

Redis caching logic should be generic and pluggable with a single helper function.

Response patterns (success, error, paginate, etc.) should be standardized in helpers/response.ts.


💾 Database & Caching

MongoDB is the main database, connected using Mongoose.

Redis is used for caching frequently accessed endpoints and should be initialized once under config/redis.ts.

Use indexes for query-heavy fields like name, email, price, etc.

MongoDB transactions should be handled inside BaseService using startSession() and withTransaction().


🧪 Testing & CI

Use Jest + Supertest for integration and unit tests.

Add a CI pipeline using GitHub Actions (.github/workflows/test.yml) that runs tests on every commit.

Tests must cover at least:

One repository method

One service method

One controller endpoint


🧱 Code Quality

Use ESLint and Prettier for consistent code style.

Always lint and format before committing.

Maintain clean commit messages (feat:, fix:, refactor:, etc.).

🧾 Documentation

Swagger/OpenAPI docs should be auto-generated from route metadata.

The README.md must include:

Project setup & environment instructions

Folder structure

Tech stack

Example API requests

Testing guide



🧰 Development Environment

Use a .env.dev file with advanced configuration for local testing.

Ensure environment isolation between development, test, and production.

🚀 Workflow

Always analyze related files before modifying — never break existing logic.

For new features, always check:

Does a base utility already exist for this purpose?

Can this be generalized instead of duplicated?

Prefer creating generic middlewares over repetitive code in routes.

Use async/await consistently — no promise chaining.

Commit only clean, working code — no commented blocks or debug logs.