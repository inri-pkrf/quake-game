import React, { useEffect, useRef, useState } from 'react';
import Scene from './Scene';
import { S, START, endingFor } from './story';
const IDLE = 90000;
export default function App() {
  const [scale,setScale]=useState(1); const [id,setId]=useState('attract'); const [risk,setRisk]=useState(30);
  const [log,setLog]=useState([]); const [pick,setPick]=useState(null); const idle=useRef();
  useEffect(()=>{const f=()=>setScale(Math.min(window.innerWidth/1080,window.innerHeight/1920));f();window.addEventListener('resize',f);return()=>window.removeEventListener('resize',f)},[]);
  const reset=()=>{setId('attract');setRisk(30);setLog([]);setPick(null)};
  const poke=()=>{clearTimeout(idle.current);idle.current=setTimeout(reset,IDLE)};
  useEffect(()=>{poke();return()=>clearTimeout(idle.current)},[id]); // eslint-disable-line
  const start=()=>{setRisk(30);setLog([]);setId(START)};
  const choose=(o,i)=>{ if(pick!==null)return; setPick(i); setTimeout(()=>{
    const nr=Math.max(0,Math.min(100,risk+o.r)); setRisk(nr); setLog(l=>[...l,{t:o.t,fb:o.fb,r:o.r}]);
    setId(o.n==='END'?'final':o.n); setPick(null);},900); };
  const sc = id==='final' ? {...S.sCount,...endingFor(risk),o:null} : S[id];
  const col = risk<35?'#3ecf6e':risk<65?'#f0b429':'#e5483a';
  return (
  <div className="wrap" onPointerDown={poke} onContextMenu={e=>e.preventDefault()}>
   <div className="stage" style={{transform:`translate(-50%,-50%) scale(${scale})`}}>
   {id==='attract' ? (
    <div className="attract" onClick={start}>
     <Scene kind="office" shake={2} risk={risk}/>
     <div className="atxt"><div className="badge">הכשרת קב"טים · יום רעידת אדמה</div>
      <h1>החלטה אחת<br/>משנה הכול</h1><p>בניין. רעידה. שניות לפעול.<br/>כל בחירה משנה את מה שיקרה אחריה.</p>
      <button className="go">גע כדי להתחיל</button></div>
    </div>
   ) : (<>
    <div className="top"><div className="ttl">{sc.title}</div>
      <div className="sec">⏱ {sc.sec} שנ' מתחילת הרעידה</div></div>
    <Scene kind={sc.kind} shake={sc.shake} risk={risk}/>
    <div className="hud"><span>רמת סיכון</span><div className="bar"><div style={{width:risk+'%',background:col}}/></div><b style={{color:col}}>{risk}</b></div>
    <div className="panel">
     <p className="story">{sc.text}</p>
     {sc.o && sc.o.map((o,i)=>
       <button key={i} className={'opt'+(pick===i?' picked':'')+(pick!==null&&pick!==i?' dim':'')} onClick={()=>choose(o,i)}>
         <span className="num">{i+1}</span><span>{o.t}</span></button>)}
     {sc.end && <Summary log={log} end={sc.end} risk={risk} again={reset}/>}
    </div></>)}
   </div></div>);
}
function Summary({log,end,risk,again}) {
  const lab={good:'מצוין!',ok:'עבר, אך אפשר לשפר',bad:'צריך תרגול'}[end];
  return <div className="sum"><div className={'verdict '+end}>{lab} · סיכון סופי {risk}</div>
    <div className="lessons">{log.slice(-5).map((l,i)=><div key={i} className={l.r>0?'bad':'good'}>{l.r>0?'✖':'✔'} {l.fb}</div>)}</div>
    <button className="go" onClick={again}>שחק שוב</button></div>;
}
