'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

const supabase = createClient();

type Factor = {
  id: string;
  friendly_name?: string | null;
  status: string;
  factor_type: string;
};

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [aal, setAal] = useState('aal1');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    setError('');
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) {
      setError(aalError.message);
      return;
    }

    const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
    if (factorError) {
      setError(factorError.message);
      return;
    }

    setAal(aalData.currentLevel ?? 'aal1');
    setFactors([
      ...(factorData.totp ?? []),
      ...(factorData.phone ?? []),
    ] as Factor[]);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function startTotp() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'TradeX Authenticator',
      });
      if (enrollError) throw enrollError;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setCode('');
      setMessage('Scannez le QR code avec votre application Authenticator, puis saisissez le code.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de démarrer le MFA.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyTotp() {
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError('Entrez un code TOTP à 6 chiffres.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;

      setQr('');
      setSecret('');
      setFactorId('');
      setCode('');
      setMessage('MFA TOTP activé. La session courante est maintenant AAL2.');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code TOTP invalide.');
    } finally {
      setBusy(false);
    }
  }

  async function removeFactor(id: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (unenrollError) throw unenrollError;
      setMessage('Facteur MFA retiré.');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de retirer le facteur MFA.');
    } finally {
      setBusy(false);
    }
  }

  const verifiedTotp = factors.filter((factor) => factor.factor_type === 'totp' && factor.status === 'verified');

  if (loading) return <div className="content"><div className="card">Chargement du Security Center…</div></div>;

  return (
    <div className="content">
      <div className="head">
        <div>
          <div className="eyebrow">Security Center</div>
          <h1>Sécurité</h1>
          <p>2FA, sessions, appareils et événements sensibles.</p>
        </div>
      </div>

      {(error || message) && (
        <div className="card section">
          {error && <p className="error">{error}</p>}
          {message && <p>{message}</p>}
        </div>
      )}

      <div className="grid g2">
        <div className="card">
          <h2>Authentification</h2>
          <table className="table"><tbody>
            <tr><td>2FA TOTP</td><td><span className={`badge ${verifiedTotp.length ? 'ok' : 'warn'}`}>{verifiedTotp.length ? 'ACTIF' : 'À CONFIGURER'}</span></td></tr>
            <tr><td>Assurance session</td><td>{aal.toUpperCase()}</td></tr>
            <tr><td>Facteurs vérifiés</td><td>{verifiedTotp.length}</td></tr>
          </tbody></table>
        </div>
        <div className="card">
          <h2>Protection</h2>
          <table className="table"><tbody>
            <tr><td>Rate limiting</td><td><span className="badge ok">ENGINE</span></td></tr>
            <tr><td>Audit</td><td><span className="badge ok">IMMUTABLE</span></td></tr>
            <tr><td>Opérations sensibles</td><td><span className="badge ok">AAL2</span></td></tr>
          </tbody></table>
        </div>
      </div>

      <div className="card section">
        <h2>Application Authenticator (TOTP)</h2>
        {!verifiedTotp.length && !factorId && (
          <button disabled={busy} onClick={startTotp}>{busy ? 'Préparation…' : 'Configurer le 2FA'}</button>
        )}

        {factorId && qr && (
          <div className="section">
            <p>Scannez ce QR code. Ne partagez jamais le secret avec quelqu’un.</p>
            <img src={qr} alt="QR code de configuration TOTP" width={220} height={220} />
            <p><strong>Secret de secours :</strong> <code>{secret}</code></p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Code à 6 chiffres"
              aria-label="Code TOTP"
            />
            <button disabled={busy || code.length !== 6} onClick={verifyTotp}>Vérifier et activer</button>
          </div>
        )}

        {verifiedTotp.length > 0 && (
          <div className="section">
            {verifiedTotp.map((factor) => (
              <div key={factor.id} className="row">
                <span>{factor.friendly_name || 'Authenticator TOTP'}</span>
                <button disabled={busy || aal !== 'aal2'} onClick={() => removeFactor(factor.id)}>Retirer</button>
              </div>
            ))}
            {aal !== 'aal2' && <p>Une session AAL2 est requise pour retirer un facteur MFA.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
