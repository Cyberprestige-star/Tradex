# TradeX V1 — Module 36 Test Suite

This package contains the first executable database-security test suite for Module 36.

## Safety

- Designed for an isolated Supabase local/test database.
- Does not create users, wallets, balances, deposits, withdrawals, trades, or real funds.
- Does not call external blockchain providers.
- Does not perform DoS/flooding or destructive security tests.
- The production project currently has pgTAP available but not installed; this is intentional in this audit.

## Run locally

1. Ensure the TradeX schema/migrations are available locally.
2. Enable pgTAP in the local database if it is not already enabled.
3. Put the SQL file under `supabase/tests/database/`.
4. Run:

`supabase test db`

Supabase executes database tests through pgTAP. Keep runtime user/authorization tests separate because they require isolated synthetic identities and sessions.

## Remaining runtime tests

The following require two or more synthetic users and valid test sessions:

- IDOR / cross-user reads and writes
- AAL1 rejection / AAL2 acceptance
- withdrawal authorization and dual approval
- ledger cross-asset manipulation
- trading risk limits
- fill replay / over-fill / position underflow
- admin privilege escalation
- emergency freeze
- worker replay
- scanner authorization
- settlement idempotency

These should run only against an isolated test project/database, never against real funds.
