# Migration Plan: Switch from Integer IDs to UUIDs

This document outlines the tasks needed to convert all primary and foreign key fields from numeric auto-increment to UUIDs (including users, schools, and all related models).

## 1. Backup and Preparation

- [x] Commit or backup current `prisma/schema.prisma` and `prisma/migrations`.
- [x] Ensure no pending migrations or uncommitted schema changes.

## 2. Update Prisma Schema (`prisma/schema.prisma`)

### 2.1 Update User model
- [x] Change `user_id Int @id @default(autoincrement())` to `user_id String @id @default(uuid())` in `model User`
- [x] Change all `user_id` FK fields to `String` in other models (e.g. `Application`, `MessageRecipient`, etc.)

### 2.2 Update School model
- [x] Change `school_id Int @id @default(autoincrement())` to `school_id String @id @default(uuid())` in `model School`
- [x] Change all `school_id` FK fields to `String` in other models (e.g. `BrowsingHistory`, `SchoolClaim`, `SchoolAdmin`, `JobPosting`, `BlockedCountry`, `FeaturedSlot`, `UserListSchools`)

For **each** model in `schema.prisma`:

- [ ] Change primary key fields:
  ```diff
  -  id    Int    @id @default(autoincrement())
  +  id    String @id @default(uuid())
  ```
- [ ] Change foreign key fields to `String`:
  ```diff
  -  userId      Int?
  +  userId      String?
  ```
- [ ] Update composite @id's on join tables:
  ```prisma
  @@id([firstId, secondId]) // ensure both are String
  ```

> **Tip:** You can leave old numeric fields alongside new UUID fields temporarily (e.g. `oldId Int`) for data migration, then drop them later.

## 3. Generate and Apply Migration

- [x] Create the migration (`yarn prisma migrate dev --name convert-ids-to-uuid`)
- [x] Regenerate Prisma client (`yarn prisma generate`)
- [ ] **Reset local database and reapply migrations**: `yarn prisma migrate reset --force`
- [ ] Review the generated SQL; ensure it alters column types or creates new columns as expected.
- [ ] If you added new columns (e.g. `id String @default(uuid())` alongside `oldId`), write a SQL script or a small Node.js script to copy existing integer IDs into the new UUIDs for referential integrity, then drop the `oldId` columns.
- [ ] Run `yarn seed:schools` to populate the `School` table after reset.

```bash
# Create the migration
yarn prisma migrate dev --name convert-ids-to-uuid
# Regenerate Prisma client
yarn prisma generate
```

## 4. Update Application Code

- [x] Globally replace all TypeScript types for IDs from number to string.
- [x] Remove all `parseInt()` on route params and request payloads; treat IDs as string.
- [x] Update Next.js API routes:
  - Parameter extraction: use string IDs (no parseInt)
  - Prisma queries: use string IDs directly (`where: { school_id: id }`)
- [x] Update React components, hooks, and state:
  - Interfaces updated to use `string` IDs.
  - Fetch calls already use string IDs in URLs/Bodies.
- [x] Update session types to reflect `user.id` and `user.managedSchoolId` as `string`.
- [ ] **Patch GET /api/featured** to use `.then/.catch` chaining so promise rejections are caught and returned as HTTP 500, preventing uncaught exceptions in tests.

## 5. Update Seed Scripts and Tests

- [x] `seedSchools.ts` inserts schools without specifying primary keys (UUIDs auto‐generated).
- [x] Refactor `fix-user-role.ts` and other maintenance scripts to lookup records by unique fields (e.g. email, site_id) and then use the returned string PKs, instead of hardcoded Int IDs.
- [x] **Install `dotenv` and `@types/dotenv`** to allow scripts to load .env variables.
- [ ] Update Jest/Playwright tests (if any) to expect string IDs.
- [ ] Run `yarn test` and fix failures.

## 6. Verification in Staging

- [ ] Deploy schema and app to a staging environment.
- [ ] Smoke-test all CRUD flows (create/read/update/delete) for all models.
- [ ] Verify relations still work (e.g. user-school claims, messaging).
- [ ] Monitor logs for missing or malformed IDs.

## 7. Production Rollout

- [ ] Schedule a maintenance window if needed.
- [ ] Apply migrations, deploy app.
- [ ] Re-run verification steps in production.

## 8. Cleanup (Post-Migration)

- [ ] Remove any temporary backup or `oldId` columns.
- [ ] Prune unused code related to numeric IDs.
- [ ] Update documentation to note UUIDs as the primary key type.

---

*Checklist updated: {{date}}*
