---
title: AttendTa PRD — Addendum
created: 2026-11-04
updated: 2026-11-04
---

# AttendTa PRD — Addendum

This addendum holds material that belongs in architecture, delivery planning, or QA documents rather than the PRD.

## A. Technical Stack (Plan p.6; SPEC §1.1)

| Concern | Choice |
|---|---|
| Web framework | ASP.NET Core MVC (C#), Razor views |
| Styling | Tailwind CSS |
| Database | SQL Server; EF Core database-first; times stored as `datetime2(3)` UTC |
| Enums | Physical SQL Server lookup tables with foreign keys (not editable by administrators) |
| File storage | Persistent server-local root outside the web root; database stores relative paths only; explicitly **not** Supabase or browser localStorage |
| QR | Server-side PNG rendered on demand from `registrations.qr_token`; library not chosen |
| PDF | Server-side landscape A4, embedded fonts, fixed template; library not chosen |
| Auth | Cookie authentication, signed and expiring; per-request current-state checks; hashing algorithm not chosen |
| Design | Figma |
| IDE / tools | Visual Studio; GitHub + GitHub Actions CI; Jira for tracking |
| Environments | Development on localhost; staging and production not defined; intranet access; one application server assumed |

Library choices for QR, PDF, and password hashing are open and belong to architecture.

## B. Data Model Summary (ERD / DBML v2.1)

Ten business tables:
- `users`
- `account_requests`
- `members`
- `event_types`
- `venues`
- `events`
- `registrations`
- `attendance`
- `certificates`
- `activity_logs`

`AttendTa-MVP.dbml` is the editable source. Known schema tensions for architecture:

1. **Attendance record uniqueness:** `attendance.registration_id` is unique, which is consistent with FR-25: re-check-in after invalidation is deferred.
2. **Nullable creator fields:** `users.created_by` and `certificates.created_by` are nullable: the setup administrator and system-created Certificate Reviews have no human creator. Other tables declare `created_by` as not null.
3. **Event cover rule:** published and completed Events require a cover; cancelled drafts may have none. Cancelled Events that were previously published keep their cover (implied by "replacement only").
4. **Capacity limit enforcement:** `participant_limit ≤ venues.capacity` is a service-layer rule (FR-9, FR-7). It cannot be enforced through foreign keys.
5. **Pending-only unique indexes:** pending-only unique indexes on `account_requests.email` and `student_number` are required, but the DBML does not express them.
6. **Student-number login lookup:** student-number login (FR-3, an override of SPEC) needs an indexed lookup through `members.student_number → user_id`. It must not reveal whether a student number exists.
7. **Check-in method enum values:** the PRD's Glossary uses the `check_in_method` enum values directly. FR-24 records `manual_search` for a name lookup and `student_number` for a student-number lookup.
8. **Nullable reason and actor fields:** reason and actor fields are nullable in the DBML, but the PRD requires them for certain states:
   - Rejection reason (FR-2)
   - Cancellation reasons (FR-12, FR-16; optional for member self-cancel, FR-18)
   - Invalidation reason (FR-25)
   - Decline notes (FR-27)
   - `reviewed_at` on waitlisted rows (FR-17 ordering)
   - Issuance fields (FR-28)

   Enforce with state-conditional CHECK constraints or in the service layer.
9. **Unified certificate table:** Certificate Review and Certificate are one table. In `certificates`, `issued` is a fourth status value. The PRD Glossary treats them as two concepts over one row, which is fine.
10. **Issuer snapshot requirement:** FR-28 requires an issuer snapshot, which the table lacks. Add `issuer_name_snapshot` or derive it from `issued_by`, which is immutable once issued.
11. **Event type description nullability:** `event_types.description` is nullable, but FR-6 requires a description. Decide whether to make it NOT NULL or relax FR-6.
12. **Append-only activity log:** append-only `activity_logs` (NFR-3, FR-33) is not enforced in the schema. Options are a deny-UPDATE/DELETE trigger or permissions on the application account.

Full gap list: `reconcile-data.md`.

## C. Delivery Ownership (SPEC §1.4; Plan p.8)

| Slice | WBS modules | SPEC owner placeholder |
|---|---|---|
| Accounts & Administration (including auth, audit infrastructure, initial admin, and lookups) | AUTH, ADM | Member 1 |
| Membership & Master Data (including image storage and pagination helpers) | MD | Member 2 |
| Events & Registration (highest lifecycle and concurrency risk) | EVT, REG | Member 3 |
| Attendance & QR | ATT, QR | Member 4 |
| Certificates & Reports | CERT, REP | Member 5 |

Team (Plan p.8):
- **PM:** Talisic, Jhon Rosell
- **Technical Manager:** Gabutan, Jerhon Clyde
- **Technical Lead:** Singco, John Paul
- **Developers:** Gabutan, Pinca, Singco, Taguiam, Talisic
- **QA:** Taguiam, Jasper
- **Approver:** Santella, Tomas Emmanuel

The UC assigns certificate eligibility to Member 4; SPEC moves it to Member 5, which takes precedence.

Effort: 46 MD / 2.3 MM (WBS). The baseline window of 10/14–10/19/2026 predates the document revisions and needs rebaselining (PRD §10 Q2).

## D. Quality Gates (git_qa_guidelines)

- **Branching:** Git Flow. `main` is production and `dev` is integration. Work happens on `feature/*` and `fix/*` branches, and PRs target `dev`. No direct pushes to `main` or `dev`, and no force-pushes.
- **Tier 1, local:** Unit tests, linting, and static analysis pass before pushing.
- **Tier 2, PR:** CI build and tests are green, with at least one peer approval.
- **Tier 3, dev integration:** E2E, cross-feature, and migration testing pass before release to `main`.
- **Commits:** Conventional Commits.

## E. Risk Register (Plan p.10–11)

| Risk | Probability | Mitigation |
|---|---|---|
| Broad scope with unfinalized edge cases | High | Finalize requirements and wireframes first. The Plan proposes deferring certificates; this PRD keeps them (PRD §7.2 note). |
| Power interruptions | High | Offline development workflow, frequent commits |
| Academic schedule conflicts | High | Smaller tasks during exam weeks; reallocate work |
| Integration/API bugs (such as scanner routes) | High | Guidelines, peer review, and regression tests |
| Typhoons/flooding (Sep–Dec) | Medium | Shift deadlines; asynchronous remote work; cloud backups |
| Team miscommunication | Medium | Stand-ups; agree on API contracts before coding |
| Tooling inexperience (ORM) | Low | Onboarding and pairing |
| Data/artifact loss | Low | Daily pushes; back up migration scripts |

Product-level risks (SPEC):
- **Concurrency.** Final Seat, Promotion, issuance, and correction can race.
- **File and SQL non-atomicity.** A file can be written without a matching database commit, leaving orphaned files.
- **Hosting.** Ephemeral hosting disks are unsuitable for storage.
- **Shared screenshots.** A screenshot of a QR Pass does not prove identity, so officer verification is still needed.
- **Transport.** Phone-camera scanning needs a secure context, so HTTPS is required beyond localhost (PRD NFR-1). An intranet certificate (self-signed or internal CA) must be trusted by officers' phones.
- **Authentication.** There is no login throttling (accepted, PRD §9.1).

## F. Document Inconsistencies (housekeeping)

These are not PRD decisions:
- The Plan's filename says v2.00, but its cover says 1.04.
- The WBS cover is dated 2026/09/11, but its revision history says 2026/11/03.
- The team member is spelled "Sinco" in one source and "Singco" in another.
- SPEC cites `../docs/UC-Project-FL (1).pdf`, but the file supplied is `docsss/UC-Project-FL.pdf`.
- The UC PDF's project description is truncated during extraction.
