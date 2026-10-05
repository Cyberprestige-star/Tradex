-- TradeX V1 — Module 36 Production Test Suite
-- PostgreSQL / pgTAP
-- Run in an isolated Supabase local/test database, NOT directly in production.
-- The suite intentionally avoids creating users, balances, funds, or external transactions.

begin;
select plan(24);

-- Schema / critical relations
select ok(to_regclass('public.profiles') is not null, 'profiles table exists');
select ok(to_regclass('public.orders') is not null, 'orders table exists');
select ok(to_regclass('public.trades') is not null, 'trades table exists');
select ok(to_regclass('public.execution_fills') is not null, 'execution_fills table exists');
select ok(to_regclass('public.withdrawals') is not null, 'withdrawals table exists');
select ok(to_regclass('public.deposits') is not null, 'deposits table exists');
select ok(to_regclass('public.custody_accounts') is not null, 'custody_accounts table exists');
select ok(to_regclass('public.market_quotes') is not null, 'market_quotes table exists');

-- RLS must remain enabled on sensitive public tables.
select ok((select c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
          where n.nspname='public' and c.relname='orders'), 'orders RLS enabled');
select ok((select c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
          where n.nspname='public' and c.relname='withdrawals'), 'withdrawals RLS enabled');
select ok((select c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
          where n.nspname='public' and c.relname='custody_accounts'), 'custody_accounts RLS enabled');

-- Sensitive functions: privilege boundaries / SECURITY DEFINER posture.
select ok((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
          where n.nspname='private' and p.proname='require_aal2' and p.prosecdef=false) = 1,
          'require_aal2 is SECURITY INVOKER');
select ok((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
          where n.nspname='private' and p.proname='has_permission' and p.prosecdef=true) = 1,
          'has_permission is SECURITY DEFINER');

select ok(not exists (
  select 1 from information_schema.routine_privileges
  where routine_schema='private' and routine_name='require_aal2'
    and grantee in ('anon','authenticated') and privilege_type='EXECUTE'
), 'require_aal2 is not directly executable by anon/authenticated');

select ok(not exists (
  select 1 from information_schema.routine_privileges
  where routine_schema='private' and routine_name='create_custody_address_request'
    and grantee in ('anon','authenticated') and privilege_type='EXECUTE'
), 'custody address RPC is not directly executable by anon/authenticated');

-- Custody network integrity.
select ok((select count(*) from public.blockchain_networks
           where code='ethereum-hoodi' and chain_id='560048'
             and native_asset='HTETH' and status='ACTIVE') = 1,
          'Hoodi HTETH network is configured correctly');
select ok((select count(*) from public.blockchain_providers
           where name='BitGo Testnet Custody' and status='ACTIVE') = 1,
          'BitGo test provider is active');

-- Trading must remain sandbox-only while real venues are absent.
select ok((select count(*) from public.execution_venues
           where status='ACTIVE' and venue_type='SANDBOX') >= 1,
          'an active sandbox execution venue exists');

-- Quote integrity: no currently stored non-finite numeric values.
select ok((select count(*) from public.market_quotes
           where bid::text in ('NaN','Infinity','-Infinity')
              or ask::text in ('NaN','Infinity','-Infinity')
              or last_price::text in ('NaN','Infinity','-Infinity')) = 0,
          'stored market quotes contain no non-finite prices');

-- Market quote timestamp sanity.
select ok((select count(*) from public.market_quotes
           where source_timestamp > received_at + interval '5 minutes') = 0,
          'stored market quotes contain no excessive future timestamp skew');

-- Critical finite-value constraints must exist after Module 35.
select ok((select count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid
           join pg_namespace n on n.oid=t.relnamespace
           where n.nspname='public' and t.relname='market_quotes'
             and c.conname in ('market_quotes_bid_finite_check','market_quotes_ask_finite_check',
                               'market_quotes_last_price_finite_check')) = 3,
          'market_quotes finite-value constraints exist');

-- Idempotency indexes / uniqueness.
select ok(to_regclass('public.custody_address_requests_custody_account_id_idempotency_key_key') is not null,
          'custody address request idempotency index exists');

-- MFA coverage on sensitive operations.
select ok((select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='private' and p.proname in
             ('request_withdrawal','cancel_withdrawal','create_vault','release_vault','submit_sandbox_order')
             and pg_get_functiondef(p.oid) like '%private.require_aal2()%') = 5,
          'five sensitive private operations require AAL2');

-- Final operational state: production data should not be required for structural tests.
select ok((select count(*) from auth.users) >= 0, 'auth schema is queryable');
select ok((select count(*) from public.profiles) >= 0, 'profiles relation is queryable');
select ok((select count(*) from public.orders) >= 0, 'orders relation is queryable');

select * from finish();
rollback;
