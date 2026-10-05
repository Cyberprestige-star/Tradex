'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';

type Dashboard = {
  profile?: {
    display_name?: string | null;
    status?: string;
  } | null;
  wallet?: {
    status?: string;
  } | null;
  deposits?: unknown[];
  withdrawals?: unknown[];
  orders?: unknown[];
  positions?: Array<{
    status?: string;
    realized_pnl?: number | string | null;
  }>;
  vaults?: Array<{
    status?: string;
    amount?: number | string;
  }>;
};

export default function Home() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data: body, error: fnError } =
        await supabase.functions.invoke('tradex-dashboard', {
          method: 'GET',
        });

      if (fnError) {
        setError(fnError.message ?? 'Impossible de charger le dashboard.');
      } else {
        setData(body as Dashboard);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  const activePositions =
    data?.positions?.filter((position) => position.status === 'OPEN').length ?? 0;

  const activeVaults =
    data?.vaults?.filter((vault) => vault.status === 'ACTIVE').length ?? 0;

  const displayName =
    data?.profile?.display_name?.trim() || 'Utilisateur';

  return (
    <div className="content home">
      <section className="hero">
        <div>
          <div className="eyebrow">TRADEX · ESPACE UTILISATEUR</div>

          <h1>
            Bonjour <span>{displayName}</span>
          </h1>

          <p>
            Gérez votre portefeuille, vos opérations de trading et vos Vaults
            depuis un espace sécurisé.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="btn" href="/wallet">
            <WalletCards size={17} />
            Wallet
          </Link>

          <Link className="btn primary" href="/trading">
            <BarChart3 size={17} />
            Trader
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {error && (
        <div className="notice section">
          <strong>Connexion au dashboard</strong>
          <br />
          {error}
        </div>
      )}

      <section className="dashboard-grid">
        <MetricCard
          label="Solde disponible"
          value="—"
          description={
            loading
              ? 'Chargement des données…'
              : 'Solde réel fourni par le ledger'
          }
          icon={<WalletCards size={20} />}
        />

        <MetricCard
          label="Vaults actifs"
          value={String(activeVaults)}
          description="Vaults actuellement actifs"
          icon={<LockKeyhole size={20} />}
        />

        <MetricCard
          label="Positions ouvertes"
          value={String(activePositions)}
          description="Positions actuellement ouvertes"
          icon={<BarChart3 size={20} />}
        />

        <MetricCard
          label="P&L réalisé"
          value="—"
          description="Données marché non connectées"
          icon={<Activity size={20} />}
        />
      </section>

      <section className="section home-columns">
        <div className="card feature-card">
          <div className="card-heading">
            <div>
              <span className="section-label">ACCÈS RAPIDE</span>
              <h2>Votre espace TradeX</h2>
            </div>
          </div>

          <div className="quick-grid">
            <QuickAction
              href="/wallet"
              icon={<WalletCards size={21} />}
              title="Wallet"
              description="Dépôts, retraits et ledger"
            />

            <QuickAction
              href="/trading"
              icon={<BarChart3 size={21} />}
              title="Trading"
              description="Ordres et positions"
            />

            <QuickAction
              href="/vault"
              icon={<LockKeyhole size={21} />}
              title="Vault"
              description="Gestion de vos Vaults"
            />

            <QuickAction
              href="/security"
              icon={<ShieldCheck size={21} />}
              title="Sécurité"
              description="Protection du compte"
            />
          </div>
        </div>

        <div className="card account-card">
          <div className="card-heading">
            <div>
              <span className="section-label">COMPTE</span>
              <h2>État du compte</h2>
            </div>

            <ShieldCheck className="blue-icon" size={22} />
          </div>

          <StatusRow
            label="Profil"
            value={data?.profile?.status ?? '—'}
          />

          <StatusRow
            label="Wallet"
            value={data?.wallet?.status ?? '—'}
          />

          <StatusRow
            label="Dépôts"
            value={String(data?.deposits?.length ?? 0)}
          />

          <StatusRow
            label="Retraits"
            value={String(data?.withdrawals?.length ?? 0)}
          />

          <StatusRow
            label="Ordres"
            value={String(data?.orders?.length ?? 0)}
          />
        </div>
      </section>

      <section className="section architecture">
        <div className="card">
          <div className="card-heading">
            <div>
              <span className="section-label">INFRASTRUCTURE</span>
              <h2>Architecture TradeX</h2>
            </div>
          </div>

          <div className="architecture-grid">
            <ArchitectureItem
              title="Wallet"
              subtitle="Ledger"
              status="Opérationnel"
            />

            <ArchitectureItem
              title="Trading"
              subtitle="Execution"
              status="Sandbox"
            />

            <ArchitectureItem
              title="Vault"
              subtitle="Gestion versionnée"
              status="Opérationnel"
            />

            <ArchitectureItem
              title="Security"
              subtitle="Risk / 2FA"
              status="Protégé"
            />
          </div>
        </div>
      </section>

      <div className="notice section">
        <strong>Intégrité financière</strong>
        <br />
        TradeX n'affiche aucune valeur financière inventée. Les soldes,
        mouvements et performances réels proviendront exclusivement du ledger
        et des services backend connectés.
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card metric-card">
      <div className="metric-icon">{icon}</div>

      <div className="metric-label">{label}</div>

      <div className="metric-value">{value}</div>

      <div className="muted">{description}</div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="quick-action">
      <div className="quick-icon">{icon}</div>

      <div className="quick-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <ChevronRight size={17} className="quick-arrow" />
    </Link>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="status-row">
      <span>{label}</span>

      <strong>
        <i className="status-dot" />
        {value}
      </strong>
    </div>
  );
}

function ArchitectureItem({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="architecture-item">
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>

      <span className="architecture-status">
        <i />
        {status}
      </span>
    </div>
  );
}
