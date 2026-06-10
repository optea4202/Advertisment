# AI Workflow Rules — Advertisement Platform

These are direct instructions for any AI coding agent working on this project. These are not suggestions. Follow them on every task, without exception.

---

## Overall Approach

**Work spec-first, always.** Before writing any code, read the relevant sections of `project-overview.md`, `architecture.md`, and `code-standards.md`. Do not begin implementation until you understand what the unit is supposed to do, what it must not do, and how it fits into the rest of the system.

**Work incrementally, one unit at a time.** A unit is a single route, a single component, a single service function, or a single migration. Complete it fully — including wiring, types, and verification — before touching the next unit.

**Do not optimise prematurely.** Build the correct thing first. Refactor only when the behaviour is verified and a specific problem exists.

**Do not invent requirements.** If a feature is not described in the project documents, do not build it. If you think something is missing, flag it as a question — do not silently add it.

---

## Scoping Rules

**Build exactly what the current task specifies — nothing more.** Do not add helper utilities, extra endpoints, convenience wrappers, or UI improvements that were not requested. Every addition is scope creep.

**Do not make speculative changes.** Do not refactor a file you were not asked to touch. Do not rename variables, reformat code, or reorganise imports in files outside the current unit. If you spot a problem elsewhere, note it — do not fix it silently.

**One file change per logical concern.** If a task requires changes to `server/routes/ads.ts`, `server/controllers/ads.ts`, and `server/services/ads.ts`, make all three changes as part of one coherent unit. Do not split a logically connected change across separate turns.

**Do not modify any of the following files without an explicit instruction from the user:**
- `project-overview.md`
- `architecture.md`
- `code-standards.md`
- `ai-workflow-rules.md`
- Any file inside `db/migrations/` that has already been applied
- Any third-party generated file (e.g., files inside `node_modules/`, lock files, generated Clerk or Cloudinary SDK types)

---

## When to Split Work Into Smaller Steps

Split the current task into smaller steps if any of the following are true:

1. **The task touches more than three files.** Identify the dependency order and complete one file at a time, starting with the deepest dependency (e.g., the query function before the service before the controller before the route).
2. **The task requires a database migration.** Write and verify the migration first. Confirm the schema is correct before writing any application code that depends on it.
3. **The task introduces a new external service integration** (e.g., Cloudinary upload, Resend email). Isolate the integration into a utility function first, test it in isolation, then wire it into the service layer.
4. **The task involves both frontend and backend changes.** Complete and verify the backend API first. Build the frontend only after the API contract is confirmed.
5. **You are unsure what the correct behaviour is.** Stop. Ask. Do not guess and proceed.

---

## Handling Missing or Ambiguous Requirements

**Never make an assumption and proceed silently.** If a requirement is missing or ambiguous, stop and ask one specific, targeted question before writing any code.

**When asking about a missing requirement:**
- State exactly what you are about to build.
- State precisely what information is missing.
- Offer two or three concrete options if relevant.
- Do not ask multiple questions at once.

**If a requirement contradicts the architecture or code standards:**
- Do not silently comply with the contradiction.
- Flag the conflict explicitly.
- Ask which takes precedence before proceeding.

**If the user's instruction conflicts with an invariant defined in `architecture.md`:**
- Do not violate the invariant.
- Explain the conflict.
- Ask the user to confirm they want to override the invariant before proceeding.

---

## Documentation Sync Rules

**Update documentation in the same step as the code change — not after.** Documentation written after the fact is documentation that never gets written.

**When you add a new API route**, update `architecture.md` if the route introduces a new system boundary or permission model.

**When you add a new database table or column**, ensure the schema in `architecture.md` reflects the change before marking the task complete.

**When you change a folder's purpose or add a new folder**, update the File Organisation section of `code-standards.md`.

**When a feature moves from Out of Scope to In Scope** (or vice versa), update `project-overview.md` immediately.

**Do not let the codebase and the documentation diverge.** If the code does something the documents do not describe, one of them is wrong. Fix the one that is wrong.

---

## Pre-Completion Verification Checklist

Before declaring any unit of work complete, verify every item on this list. Do not skip items. Do not mark a unit complete if any item is unresolved.

### Code Correctness
- [ ] The code does exactly what the task specified — no more, no less.
- [ ] All TypeScript types are explicit. There are no uses of `any` or unresolved type errors.
- [ ] All external input (request body, query params, URL params) is validated with Zod before use.
- [ ] No secrets, API keys, or credentials appear anywhere in the code.

### Security and Access Control
- [ ] Every new protected route has the Clerk auth middleware applied.
- [ ] Every mutation route verifies ownership before writing to the database.
- [ ] Banned users are blocked by middleware — not by client-side logic alone.
- [ ] No raw SQL errors or internal stack traces are returned to the client.

### Data Integrity
- [ ] All SQL queries use parameterised statements — no string interpolation.
- [ ] Any new database table or column has a corresponding migration file in `db/migrations/`.
- [ ] If images are involved, Cloudinary deletion is handled before the database record is removed.
- [ ] The ad image limit of 5 is enforced at the API layer.

### Standards Compliance
- [ ] The code follows all rules in `code-standards.md`.
- [ ] The file lives in the correct folder as defined in the File Organisation section.
- [ ] No unrelated files were modified.
- [ ] No dead code, commented-out blocks, or unused imports remain.

### Documentation
- [ ] All relevant documentation files are up to date with the changes made.
- [ ] If a new invariant was introduced, it is documented in `architecture.md`.

### Functional Verification
- [ ] The happy path works end-to-end.
- [ ] At least one error case is handled and returns the correct HTTP status code.
- [ ] The frontend and backend agree on the response shape for this unit.

---

## Prohibited Behaviours

**Never do any of the following:**

- Write a migration and immediately alter the production database without instruction.
- Install a new npm package without explicitly stating the package name, its purpose, and asking for approval first.
- Rename, move, or delete a file that was not part of the current task.
- Write placeholder, stub, or TODO code and mark the task as complete.
- Use `console.log` for production debugging — use a structured logger or remove it.
- Bypass the ownership check because "the frontend already checks it."
- Skip the pre-completion checklist because the task feels small.
- Generate a new Clerk or Cloudinary key or credential — always ask the user to provide them.
