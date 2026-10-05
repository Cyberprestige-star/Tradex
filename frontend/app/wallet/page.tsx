'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type DepositApi={wallet?:{status?:string}|null;deposit_addresses?:unknown[];deposits?:unknown[]};
type WithdrawalApi={withdrawals?:Array<{id:string;amount:string|number;status:string;risk_status:string;created_at:string}>};

export default function Wallet(){
 const [deposit,setDeposit]=useState<DepositApi|null>(null); const [withdrawals,setWithdrawals]=useState<WithdrawalApi|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{(async()=>{const s=createClient();const [d,w]=await Promise.all([s.functions.invoke<DepositApi>('tradex-deposit?action=status',{method:'GET'}),s.functions.invoke<WithdrawalApi>('tradex-withdrawal?action=history',{method:'GET'})]);if(d.error)setError(d.error.message);else setDeposit(d.data);if(w.error)setError(w.error.message);else setWithdrawals(w.data);setLoading(false)})()},[]);
 return <div className="content"><div className="head"><div><div className="eyebrow">Wallet Engine</div><h1>Wallet</h1><p>Données connectées au backend. Les transferts blockchain réels restent protégés par la custody.</p></div></div>{error&&<div className="notice section">{error}</div>}<div className="grid g3"><Metric t="Wallet" v={loading?'…':deposit?.wallet?.status??'NON PROVISIONNÉ'}/><Metric t="Adresses dépôt" v={String(deposit?.deposit_addresses?.length??0)}/><Metric t="Retraits" v={String(withdrawals?.withdrawals?.length??0)}/></div><div className="grid g2 section"><div className="card"><h2>Dépôt</h2><p>Adresse → blockchain → confirmations → Risk Engine → ledger → solde.</p><div className="notice section">La custody réelle reste désactivée tant que le provider n’est pas opérationnel.</div></div><div className="card"><h2>Retraits</h2>{!withdrawals?.withdrawals?.length?<div className="empty">Aucun retrait.</div>:withdrawals.withdrawals.map(w=><div className="row" key={w.id}><span>{w.amount} · {w.status}</span><strong>{w.risk_status}</strong></div>)}</div></div><div className="card section"><h2>Adresses de dépôt</h2>{!deposit?.deposit_addresses?.length?<div className="empty">Aucune adresse active.</div>:<pre>{JSON.stringify(deposit.deposit_addresses,null,2)}</pre>}</div></div>
}
function Metric({t,v}:{t:string,v:string}){return <div className="card"><div className="metric-label">{t}</div><div className="metric">{v}</div></div>}
