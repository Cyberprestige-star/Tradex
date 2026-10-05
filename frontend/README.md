# TradeX V1

TradeX is a crypto trading, wallet, Vault and administration platform foundation.

## Current implementation
- Next.js 15 / React 19 / TypeScript
- Supabase Auth client/server integration
- Login / signup screen
- Supabase middleware session refresh
- Dashboard, Trading sandbox, Wallet, Vault + fee engine, Transactions, Support, Security, DG Command Center
- Supabase project: `qeafpglktppvtnlkdipv`
- Database: 31 public tables, all with RLS enabled
- Atomic ledger transfer function + transaction/posting journal
- RBAC roles/permissions and private authorization function
- Admin dual-approval table
- Risk, geo policy, emergency controls, support, promotions, referrals, notifications
- JWT-protected `tradex-dashboard` Edge Function

## Environment
Create `.env.local` from `.env.example`:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

Use only the publishable/anon key in the browser. Never expose a service-role key.

## Run
npm install
npm run dev

## Important
The application is **not yet a live custody/exchange**. Deposits, withdrawals and live trading remain disabled until custody/address infrastructure, blockchain monitoring, risk/AML, execution/liquidity, reconciliation, MFA and production security controls are implemented and tested.

## Next gates
1. Provision user wallet records and deposit addresses through a custody provider.
2. Build blockchain monitor + confirmation/risk pipeline.
3. Add MFA/re-authentication and sensitive-action controls.
4. Implement atomic withdrawal/deposit business workflows.
5. Add execution/liquidity adapter and order engine.
6. Implement Vault lock/release/reward/early-exit transactions.
7. Build DG reports, audit replay and admin dual-control workflows.
8. Add automated tests, reconciliation, monitoring, backups and incident response.
9. Complete legal/regulatory and security review before real-money launch.
