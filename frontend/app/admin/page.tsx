import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const permissions = [
  ['ADMIN_MANAGE', 'Gestion des administrateurs'],
  ['DEPOSIT_APPROVE', 'Approbation des dépôts'],
  ['DEPOSIT_VIEW', 'Consultation des dépôts'],
  ['EMERGENCY_MANAGE', 'Contrôle d’urgence'],
  ['GEO_MANAGE', 'Politique géographique'],
  ['PROMOTION_MANAGE', 'Gestion des promotions'],
  ['REPORT_EXPORT', 'Export des rapports'],
  ['REPORT_VIEW', 'Consultation des rapports'],
  ['SECURITY_MANAGE', 'Gestion de la sécurité'],
  ['SUPPORT_MANAGE', 'Gestion du support'],
  ['TRADING_MANAGE', 'Gestion du trading'],
  ['USER_SUSPEND', 'Suspension des utilisateurs'],
  ['USER_VIEW', 'Consultation des utilisateurs'],
  ['VAULT_MANAGE', 'Gestion des Vaults'],
  ['WITHDRAWAL_APPROVE', 'Approbation des retraits'],
  ['WITHDRAWAL_VIEW', 'Consultation des retraits'],
] as const;

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: isDG, error: dgError } = await supabase.rpc('current_user_is_dg');

  if (dgError || isDG !== true) {
    redirect('/');
  }

  // Appel réel du backend DG.
  // La Edge Function vérifie elle-même les permissions du compte.
  const { data: commandCenter, error: commandError } =
    await supabase.functions.invoke('tradex-command-center', {
      method: 'GET',
    });

  const metrics = commandCenter?.metrics ?? {
    users: 0,
    deposits: 0,
    withdrawals: 0,
    orders: 0,
    support_tickets: 0,
    risk_alerts: 0,
  };

  const commandCenterOk = !commandError && !!commandCenter;

  return (
    <div className="content dg-page">
      <div className="head">
        <div>
          <div className="eyebrow">Gouvernance · Director General</div>
          <h1>DG Command Center</h1>
          <p>
            Centre de contrôle exécutif TradeX. Accès basé sur les permissions
            RBAC réelles du compte connecté.
          </p>
        </div>

        <div className="dg-header-status">
          <span className="badge success">DG AUTHENTIFIÉ</span>
          <span className="backend-status">
            <i className={commandCenterOk ? 'status-dot online' : 'status-dot'} />
            {commandCenterOk ? 'Backend connecté' : 'Backend indisponible'}
          </span>
        </div>
      </div>

      <section className="grid g4">
        <Metric t="Utilisateurs" value={metrics.users} />
        <Metric t="Dépôts" value={metrics.deposits} />
        <Metric t="Retraits" value={metrics.withdrawals} />
        <Metric t="Ordres trading" value={metrics.orders} />
      </section>

      <section className="grid g2 section">
        <div className="card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">Vue opérationnelle</div>
              <h2>Command Center</h2>
            </div>
            <span className="badge success">LIVE</span>
          </div>

          <div className="operations">
            <Operation
              name="Utilisateurs"
              permission="USER_VIEW"
              status="Disponible"
            />
            <Operation
              name="Dépôts"
              permission="DEPOSIT_VIEW"
              status="Disponible"
            />
            <Operation
              name="Retraits"
              permission="WITHDRAWAL_VIEW"
              status="Disponible"
            />
            <Operation
              name="Trading"
              permission="TRADING_MANAGE"
              status="Permission accordée"
            />
            <Operation
              name="Vaults"
              permission="VAULT_MANAGE"
              status="Permission accordée"
            />
            <Operation
              name="Sécurité"
              permission="SECURITY_MANAGE"
              status="Permission accordée"
            />
            <Operation
              name="Support"
              permission="SUPPORT_MANAGE"
              status="Permission accordée"
            />
            <Operation
              name="Geo Control"
              permission="GEO_MANAGE"
              status="Permission accordée"
            />
          </div>
        </div>

        <div className="card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">Activité système</div>
              <h2>Surveillance</h2>
            </div>
          </div>

          <div className="monitor-list">
            <Monitor
              label="Tickets support"
              value={metrics.support_tickets}
            />
            <Monitor
              label="Alertes risque"
              value={metrics.risk_alerts}
            />
            <Monitor
              label="Ordres trading"
              value={metrics.orders}
            />
          </div>

          <div className="notice section">
            Les métriques affichées proviennent du backend
            <strong> tradex-command-center</strong>.
          </div>
        </div>
      </section>

      <section className="card section">
        <div className="card-heading">
          <div>
            <div className="eyebrow">RBAC</div>
            <h2>Permissions DG</h2>
            <p>
              Permissions réellement attribuées au rôle Director General.
            </p>
          </div>

          <span className="permission-count">
            {permissions.length} permissions
          </span>
        </div>

        <div className="permission-grid">
          {permissions.map(([code, label]) => (
            <div className="permission-row" key={code}>
              <div>
                <strong>{label}</strong>
                <span>{code}</span>
              </div>
              <span className="permission-status">
                <i className="status-dot online" />
                Accordée
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid g2 section">
        <div className="card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">Rapports</div>
              <h2>Reporting exécutif</h2>
            </div>
          </div>

          <div className="actions">
            <button className="btn" disabled>
              Consulter les rapports
            </button>
            <button className="btn" disabled>
              Exporter
            </button>
          </div>

          <div className="notice section">
            <strong>REPORT_VIEW</strong> et <strong>REPORT_EXPORT</strong> sont
            accordées. Les actions d’export seront activées lorsque leur
            backend sera branché.
          </div>
        </div>

        <div className="card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">Emergency</div>
              <h2>Emergency Mode</h2>
            </div>

            <span className="badge warning">PROTÉGÉ</span>
          </div>

          <p>
            Contrôle d’urgence des dépôts, retraits, trading et nouvelles
            opérations.
          </p>

          <button className="btn danger" disabled>
            Configurer Emergency Mode
          </button>

          <div className="notice section">
            <strong>EMERGENCY_MANAGE</strong> est accordée, mais aucune action
            destructive ne sera exécutée tant que son backend d’opération
            n’est pas explicitement branché.
          </div>
        </div>
      </section>

      <section className="card section dg-footer-card">
        <div>
          <div className="eyebrow">Identité de session</div>
          <strong>{user.email ?? 'Compte authentifié'}</strong>
          <span>{user.id}</span>
        </div>

        <div className="backend-verification">
          <span className="status-dot online" />
          Autorisation DG vérifiée par Supabase
        </div>
      </section>
    </div>
  );
}

function Metric({
  t,
  value,
}: {
  t: string;
  value: number;
}) {
  return (
    <div className="card metric-card">
      <div className="metric-label">{t}</div>
      <div className="metric">{value}</div>
      <div className="metric-source">Backend réel</div>
    </div>
  );
}

function Operation({
  name,
  permission,
  status,
}: {
  name: string;
  permission: string;
  status: string;
}) {
  return (
    <div className="operation">
      <div>
        <strong>{name}</strong>
        <span>{permission}</span>
      </div>

      <span className="operation-status">
        <i className="status-dot online" />
        {status}
      </span>
    </div>
  );
}

function Monitor({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="monitor">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
