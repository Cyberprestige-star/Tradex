'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Command,
  Headphones,
  LockKeyhole,
  Settings,
  ShieldCheck,
  WalletCards,
  CircleHelp,
} from 'lucide-react';

const items = [
  ['/','Vue d’ensemble',Command],
  ['/trading','Trading',BarChart3],
  ['/wallet','Wallet',WalletCards],
  ['/vault','Vault',LockKeyhole],
  ['/activity','Transactions',Activity],
  ['/support','Support',Headphones],
  ['/security','Sécurité',ShieldCheck],
  ['/admin','DG Command Center',Settings],
] as const;

export function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="shell">

      <aside className="side">

        <div className="brand">
          <div className="logo">
            <span>T</span>
          </div>

          <div className="brand-text">
            <strong>TradeX</strong>
            <span>Financial Platform</span>
          </div>
        </div>

        <div className="nav-title">
          ESPACE UTILISATEUR
        </div>

        <nav className="nav">
          {items.map(([href, label, Icon]) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={active ? 'active' : ''}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span>{label}</span>

                {active && <i className="nav-active-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="side-bottom">

          <div className="security-mini">
            <div className="security-mini-icon">
              <ShieldCheck size={17} />
            </div>

            <div>
              <strong>Compte protégé</strong>
              <span>Infrastructure sécurisée</span>
            </div>
          </div>

          <div className="version">
            <span>TradeX</span>
            <span>V1.0</span>
          </div>

        </div>

      </aside>

      <main className="main">

        <header className="top">

          <div className="top-left">
            <div className="system-status">
              <span className="system-dot" />
              <span>Système opérationnel</span>
            </div>

            <span className="top-divider" />

            <span className="environment">
              PRODUCTION
            </span>
          </div>

          <div className="top-right">

            <div className="secure-status">
              <ShieldCheck size={15} />
              <span>Ledger protégé</span>
            </div>

            <Link href="/support" className="help-button">
              <CircleHelp size={17} />
            </Link>

          </div>

        </header>

        {children}

      </main>

    </div>
  );
}
