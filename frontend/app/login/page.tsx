'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [mode,setMode] = useState<'login'|'signup'>('login');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === 'signup') setMessage('Compte créé. Vérifie ton email si la confirmation est activée.');
    else router.push('/');
  }

  return <div className="content" style={{maxWidth:560,margin:'80px auto'}}>
    <div className="card">
      <div className="eyebrow">TradeX · Identity Engine</div>
      <h1>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1>
      <p className="muted">Authentification Supabase. Aucun solde ou transaction n’est simulé.</p>
      <form onSubmit={submit} style={{display:'grid',gap:14,marginTop:24}}>
        <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required />
        <button className="btn primary" disabled={busy}>{busy ? 'Traitement…' : mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button>
      </form>
      {message && <div className="notice section">{message}</div>}
      <button className="btn section" onClick={()=>setMode(mode==='login'?'signup':'login')}>
        {mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}
      </button>
    </div>
  </div>;
}
