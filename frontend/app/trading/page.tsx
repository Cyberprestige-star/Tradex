'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type Order = { id:string; asset_id:string; side:string; order_type:string; quantity:string|number; filled_quantity:string|number; status:string; created_at:string };
type Position = { id:string; asset_id:string; quantity:string|number; average_entry_price:string|number; realized_pnl:string|number|null; status:string; updated_at:string };

type ApiResponse = { orders?:Order[]; positions?:Position[]; error?:string };

export default function Trading(){
  const [orders,setOrders]=useState<Order[]>([]);
  const [positions,setPositions]=useState<Position[]>([]);
  const [assetId,setAssetId]=useState('');
  const [side,setSide]=useState<'BUY'|'SELL'>('BUY');
  const [orderType,setOrderType]=useState('MARKET');
  const [quantity,setQuantity]=useState('');
  const [limitPrice,setLimitPrice]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  async function load(){
    const supabase=createClient();
    const [o,p]=await Promise.all([
      supabase.functions.invoke<ApiResponse>('tradex-trading?resource=orders',{method:'GET'}),
      supabase.functions.invoke<ApiResponse>('tradex-trading?resource=positions',{method:'GET'})
    ]);
    if(o.error) setError(o.error.message); else setOrders(o.data?.orders??[]);
    if(p.error) setError(p.error.message); else setPositions(p.data?.positions??[]);
  }
  useEffect(()=>{load();},[]);

  async function submit(){
    setBusy(true);setError('');setMessage('');
    try{
      if(!assetId.trim()||!quantity||Number(quantity)<=0) throw new Error('Actif et quantité valides requis.');
      const supabase=createClient();
      const {data,error:e}=await supabase.functions.invoke('tradex-trading',{method:'POST',body:{action:'create_sandbox_order',asset_id:assetId.trim(),side,order_type:orderType,quantity:Number(quantity),limit_price:limitPrice?Number(limitPrice):null,stop_price:null}});
      if(e) throw e;
      if(data?.error) throw new Error(data.error==='mfa_required'?'MFA AAL2 requis.':data.message??data.error);
      setMessage(`Ordre créé : ${data.order_id}`); await load();
    }catch(e){setError(e instanceof Error?e.message:'Échec de l’ordre.');}
    finally{setBusy(false);}
  }

  return <Page title="Trading" eyebrow="Trading Engine" desc="Trading sandbox connecté au backend, Risk Engine et routage.">
    {(error||message)&&<div className="card section">{error&&<p className="error">{error}</p>}{message&&<p>{message}</p>}</div>}
    <div className="grid g3"><Metric t="Marché" v="SANDBOX"/><Metric t="Liquidité" v="Provider à configurer"/><Metric t="Risk Engine" v="READY"/></div>
    <div className="grid g2 section">
      <div className="card"><h2>Nouvel ordre sandbox</h2><div className="form">
        <div className="field"><label>Asset ID</label><input value={assetId} onChange={e=>setAssetId(e.target.value)} placeholder="UUID de l’actif"/></div>
        <div className="field"><label>Sens</label><select value={side} onChange={e=>setSide(e.target.value as 'BUY'|'SELL')}><option>BUY</option><option>SELL</option></select></div>
        <div className="field"><label>Type</label><select value={orderType} onChange={e=>setOrderType(e.target.value)}><option>MARKET</option><option>LIMIT</option><option>STOP</option><option>STOP_LIMIT</option><option>TAKE_PROFIT</option><option>STOP_LOSS</option></select></div>
        <div className="field"><label>Quantité</label><input type="number" min="0" step="any" value={quantity} onChange={e=>setQuantity(e.target.value)}/></div>
        {(orderType==='LIMIT'||orderType==='STOP_LIMIT')&&<div className="field"><label>Prix limite</label><input type="number" min="0" step="any" value={limitPrice} onChange={e=>setLimitPrice(e.target.value)}/></div>}
        <button className="btn primary" disabled={busy} onClick={submit}>{busy?'Traitement…':'Passer l’ordre sandbox'}</button>
      </div></div>
      <div className="card"><h2>Positions</h2>{positions.length===0?<div className="empty">Aucune position.</div>:positions.map(p=><div className="row" key={p.id}><span>{p.asset_id} · {p.quantity} · {p.status}</span><strong>{p.realized_pnl??'—'}</strong></div>)}</div>
    </div>
    <div className="card section"><h2>Ordres récents</h2>{orders.length===0?<div className="empty">Aucun ordre.</div>:<div className="table-wrap"><table className="table"><tbody>{orders.map(o=><tr key={o.id}><td>{o.asset_id}</td><td>{o.side}</td><td>{o.order_type}</td><td>{o.quantity}</td><td>{o.status}</td></tr>)}</tbody></table></div>}</div>
  </Page>
}
function Page({children,title,eyebrow,desc}:{children:React.ReactNode,title:string,eyebrow:string,desc:string}){return <div className="content"><div className="head"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div><span className="badge warn">SANDBOX</span></div>{children}</div>}
function Metric({t,v}:{t:string,v:string}){return <div className="card"><div className="metric-label">{t}</div><div className="metric">{v}</div></div>}
