import React, { useEffect, useRef, useState } from 'react';
import Scene, { IMG, RATIOS, project } from './Scene';
import { S, START, endingFor } from './story';
import { H } from './hotspots';
import * as A from './audio';
const IDLE = 120000, PUB = process.env.PUBLIC_URL, TMAX = 250; // TMAX = עשיריות שנייה (25 שניות להחלטה)
const L = (t,stage,lvl) => ({t,stage,lvl});
const PLAN = {
  sRun:{s:[L(0,'before',1),L(1500,'mid',2),L(3300,'after',3)],d:7000},
  sDoor:{s:[L(0,'before',1),L(1500,'mid',2),L(3200,'during',3)],d:6500},
  s2:{s:[L(0,'after',1)],d:3200}, s3:{s:[L(0,'medic',0)],d:2200}, sMed:{s:[L(0,'medic',0)],d:1500},
  sEvac:{s:[L(0,'after',0)],d:2200},
  sStairs:{s:[L(0,'before',0),L(1300,'mid',1),L(3000,'after',2),L(5000,'after',1)],d:6800},
  sOut:{s:[L(0,'mid',0),L(1800,'after',2),L(3600,'after',0)],d:5200}, sCount:{s:[L(0,'count',0),L(3000,'missing',0)],d:5200},
  eBad1:{s:[L(0,'after',2)],d:4500}, eBad2:{s:[L(0,'before',0),L(1400,'after',3)],d:6500},
  eBad3:{s:[L(0,'before',0),L(1300,'mid',1),L(2700,'debris',2),L(4100,'wall',3),L(5600,'after',3),L(7300,'collapse',3)],d:9800},
  eBad4:{s:[L(0,'mid',0),L(1500,'after',3)],d:6500}, eMix:{s:[L(0,'rubble',0)],d:2500}};
const sceneOf = (id, risk) => id==='final' ? {...S.sCount,...endingFor(risk),o:null} : (S[id]||{});
const planOf = (id, risk) => id==='final' ? {s:[L(0,endingFor(risk).end==='bad'?'missing':'gather',0)],d:2500} : (PLAN[id]||{s:[L(0,'after',0)],d:1800});

function Seismo({lvl,className}) {
  const [p,setP]=useState(Array(100).fill(0)); const Lr=useRef(lvl); Lr.current=lvl;
  useEffect(()=>{let raf,last=0;const f=t=>{if(t-last>40){last=t;setP(a=>[...a.slice(1),(Math.random()*2-1)*[3,10,38,90][Lr.current]])}raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);return()=>cancelAnimationFrame(raf)},[]);
  return <svg viewBox="0 0 1000 200" className={className} preserveAspectRatio="none"><polyline fill="none" stroke={lvl>1?'#e0503f':'#c9a227'} strokeWidth="3" points={p.map((v,i)=>`${i*10},${100+v}`).join(' ')}/></svg>;
}
export default function App() {
  const [scale,setScale]=useState(1), [id,setId]=useState('attract'), [risk,setRisk]=useState(30), [log,setLog]=useState([]), [pick,setPick]=useState(null);
  const [phase,setPhase]=useState('play'), [lvl,setLvl]=useState(0), [stage,setStage]=useState('before'), [fade,setFade]=useState(.5), [cap,setCap]=useState(''), [flash,setFlash]=useState(false), [tremor,setTremor]=useState(0);
  const [seen,setSeen]=useState({}), [card,setCard]=useState(null), [left,setLeft]=useState(null), [toast,setToast]=useState('');
  const idle=useRef(), skipRef=useRef(), R=useRef(risk), pickRef=useRef(false), award=useRef({}), tScan=useRef(); R.current=risk;
  useEffect(()=>{const f=()=>setScale(Math.min(window.innerWidth/1080,window.innerHeight/1920));f();window.addEventListener('resize',f);
    Object.values(IMG).forEach(o=>Object.values(o).forEach(u=>{const i=new Image();i.onload=()=>{RATIOS[u]=i.naturalWidth/i.naturalHeight};i.src=u}));return()=>window.removeEventListener('resize',f)},[]);
  const reset=()=>{A.stop();setId('attract');setRisk(30);setLog([]);setPick(null);setLvl(0);setLeft(null);setPhase('play');award.current={}};
  const poke=()=>{clearTimeout(idle.current);idle.current=setTimeout(reset,IDLE)};
  useEffect(()=>{poke();return()=>clearTimeout(idle.current)},[id,phase]); // eslint-disable-line
  const fl=()=>{setFlash(true);setTimeout(()=>setFlash(false),160)};
  useEffect(()=>{ if(id!=='attract')return; setStage('after');setFade(1);
    const run=()=>{setTremor(Math.random()<.4?3:2);setTimeout(()=>setTremor(0),2400)}; const a=setTimeout(run,1500), iv=setInterval(run,8000);
    return()=>{clearTimeout(a);clearInterval(iv);setTremor(0)}; },[id]);

  useEffect(()=>{
    if(id==='attract'){A.stop();return;}
    const sc=sceneOf(id,R.current), T=[]; const at=(ms,f)=>T.push(setTimeout(f,ms));
    const hits=(arr)=>arr.forEach(d=>at(d,()=>{A.hit();fl()}));
    const toNext=()=>{if(H[id]&&H[id].length&&sc.o)setPhase('scan');else{A.alarm(0);setPhase('ask')}};
    const done=()=>{setLvl(0);A.rumble(0);toNext()};
    clearTimeout(tScan.current);setSeen({});setCard(null);setLeft(null);setPick(null);pickRef.current=false;
    setPhase('play');
    if(id==='s1'){
      skipRef.current=()=>{T.forEach(clearTimeout);setFade(.4);setStage('after');A.ring(3);done();};
      setFade(.9);setStage('before');setLvl(0);setCap('יום שלישי, 10:41. קומה 3. יום עבודה רגיל.');A.ambient(1);A.alarm(0);
      at(3800,()=>{setCap('10:42');setLvl(1);A.rumble(1);A.vib(80)});
      at(5600,()=>{setCap('רעידת אדמה');setFade(.25);setStage('mid');setLvl(2);A.rumble(2);A.vib([120,60,120]);fl()});
      at(7600,()=>{setCap('');setFade(.18);setStage('during');setLvl(3);A.rumble(3);A.vib([300,100,400,100,600]);A.glass();fl();hits([900,1700,2500,3400,4300])});
      at(10800,()=>{setFade(.22);setStage('strong');A.hit();fl()});
      at(14000,()=>{setLvl(2);A.rumble(2)});
      at(15200,()=>{setFade(3);setStage('after');setLvl(1);A.rumble(1);A.ambient(0)});
      at(16600,()=>{setLvl(0);A.rumble(0);A.alarm(1);A.ring(5);setCap('שקט. אבק. אזעקה מרחוק.')});
      at(19400,toNext);
    } else {
      const pl=planOf(id,R.current), mx=Math.max(...pl.s.map(s=>s.lvl)); setCap(sc.title);A.alarm(sc.kind!=='outside'?1:0);
      skipRef.current=()=>{T.forEach(clearTimeout);setFade(.4);setStage(pl.s[pl.s.length-1].stage);A.ring(2);done();};
      pl.s.forEach((s,i)=>{const f=()=>{setFade(i===0?.9:(s.lvl>=2?.18:1.6));setStage(s.stage);setLvl(s.lvl);A.rumble(s.lvl);A.ambient(s.lvl===0&&i===0);
        if(s.lvl>=2){A.glass();fl();A.vib([200,80,300]);hits([500,1400,2400])}else if(s.lvl===1&&i>0){fl();A.hit()}};
        s.t?at(s.t,f):f();});
      at(pl.d,()=>{A.ambient(0);if(mx>0)A.ring(2);done()});
    }
    return()=>T.forEach(clearTimeout);
  },[id]); // eslint-disable-line

  // טיימר החלטה
  useEffect(()=>{ if(phase!=='ask'||id==='attract'||!sceneOf(id,R.current).o)return; setLeft(TMAX);
    const iv=setInterval(()=>setLeft(l=>l===null?l:Math.max(0,l-1)),100); return()=>clearInterval(iv)},[phase,id]);
  useEffect(()=>{ if(left!==null&&left>0&&left<=50&&left%10===0)A.tick();
    if(left===0){const sc=sceneOf(id,R.current); if(sc.o&&!pickRef.current){let bi=0;sc.o.forEach((o,i)=>{if(o.r>sc.o[bi].r)bi=i});choose({...sc.o[bi],fb:'לא התקבלה החלטה בזמן. '+sc.o[bi].fb},bi);}} },[left]); // eslint-disable-line
  // סריקה מלאה
  const hs=id!=='attract'&&phase==='scan'&&sceneOf(id,risk).o?(H[id]||[]):[];
  useEffect(()=>{ if(hs.length&&hs.every((_,i)=>seen[i])&&!award.current[id]){award.current[id]=1;setRisk(r=>Math.max(0,r-3));setToast('סריקה מלאה · סיכון −3');setTimeout(()=>setToast(''),2200);tScan.current=setTimeout(()=>{A.alarm(0);setPhase('ask')},3800)} },[seen]); // eslint-disable-line

  const start=()=>{A.unlock();setRisk(30);setLog([]);award.current={};setId(START)};
  function choose(o,i){ if(pickRef.current)return; pickRef.current=true; setPick(i); setLeft(null); setCard(null); A.vib(40); setTimeout(()=>{
    const nr=Math.max(0,Math.min(100,R.current+o.r)); setRisk(nr); setLog(l=>[...l,{t:o.t,fb:o.fb,r:o.r}]);
    setId(o.n==='END'?'final':o.n);},900); }
  const openHs=(i)=>{A.tick();setSeen(s=>({...s,[i]:1}));setCard(i)};
  const sc=sceneOf(id,risk), ask=phase==='ask', cnt=hs.filter((_,i)=>seen[i]).length;
  const col=risk<35?'#3f9d66':risk<65?'#c9a227':'#c0392b';
  return (
  <div className="wrap" onPointerDown={poke} onContextMenu={e=>e.preventDefault()}>
   <div className="stage" style={{transform:`translate(-50%,-50%) scale(${scale})`}}>
   {id==='attract' ? (
    <div className="attract" onClick={start}>
     <Scene kind="stairs" stage="after" lvl={tremor} fade={1} full/>
     <div className="shade a"/><img className="logo" src={PUB+'/logo.svg'} alt=""/>
     <div className="atxt">
      <div className="badge">הכשרת קב"טים · יום ממוקד רעידת אדמה</div>
      <h1>החלטה אחת<br/>משנה הכול</h1><div className="rule"/>
      <p>רעידת אדמה. שניות להחליט.</p>
      <Seismo lvl={tremor} className="seisA"/>
      <button className="go">לחצו להתחלה</button><div className="hint">מומלץ להפעיל קול</div>
     </div>
    </div>
   ) : (<>
    <Scene kind={sc.kind} stage={stage} lvl={lvl} fade={fade} full={phase!=='ask'}/>
    <img className="logo" src={PUB+'/logo.svg'} alt=""/>
    <div className={'playui'+(phase==='play'?'':' hide')}>
      <div className="shade"/><div className="live"><span className="dot"/>מד רעידות · עוצמה {['—','3.0','5.5','7.0'][lvl]}</div>
      <div className="cap" key={cap}>{cap}</div><Seismo lvl={lvl} className="seisP"/>
      <button className="skip" onClick={()=>skipRef.current&&skipRef.current()}>דלג</button>
    </div>
    <div className={'flash'+(flash?' on':'')}/>
    {phase==='scan' && <>
      {hs.map((h,i)=>{const p=project(sc.kind,stage,h.u,h.v);return <button key={i} className={'hs'+(seen[i]?' seen':'')} style={{left:p.x-60,top:p.y-60}} onClick={()=>openHs(i)}><i/></button>})}
      {card!==null && hs[card] && (()=>{const p=project(sc.kind,stage,hs[card].u,hs[card].v), rt=p.x>540, st={top:Math.max(160,Math.min(1600,p.y-70))};
        if(rt)st.right=1080-p.x+64; else st.left=p.x+64;
        return <div className={'hcard '+(rt?'rt':'lf')} style={st} key={card} onClick={()=>setCard(null)}>{hs[card].t}</div>})()}
      {toast && <div className="toast">{toast}</div>}
      <div className="scanui"><div className="shade"/><div className="scap">גע בנקודות הזהובות כדי לסרוק את הזירה <span>{cnt}/{hs.length}</span></div>
      <button className="skip" onClick={()=>{clearTimeout(tScan.current);A.alarm(0);setPhase('ask')}}>דלג להחלטה</button></div>
    </>}
    {ask && <>
      <div className="top"><div className="ttl">{sc.title}</div><div className="sec">+{sc.sec} שנ' מתחילת הרעידה</div></div>
      <div className="hud"><span>רמת סיכון</span><div className="bar"><div style={{width:risk+'%',background:col}}/></div><b style={{color:col}}>{risk}</b></div>
      <div className="panel in">
       {sc.o && left!==null && <div className={'tmr'+(left<=70?' low':'')}><div style={{width:(left/TMAX*100)+'%'}}/></div>}
       {sc.o && <div className="q">מה אתה עושה? {left!==null && <span className={left<=70?'low':''}>{Math.ceil(left/10)}</span>}</div>}
       <p className="story">{sc.text}</p>
       {sc.o && sc.o.map((o,i)=><button key={i} className={'opt'+(pick===i?' picked':'')+(pick!==null&&pick!==i?' dim':'')} onClick={()=>choose(o,i)}><span className="num">{i+1}</span><span>{o.t}</span></button>)}
       {sc.end && <Summary log={log} end={sc.end} risk={risk} again={reset}/>}
      </div></>}
   </>)}
   </div></div>);
}
function Summary({log,end,risk,again}) {
  const lab={good:'ביצוע מצוין',ok:'ביצוע סביר, יש מה לשפר',bad:'נדרש תרגול נוסף'}[end];
  return <div className="sum"><div className={'verdict '+end}>{lab} · סיכון סופי {risk}</div>
    <div className="lessons">{log.slice(-5).map((l,i)=><div key={i} className={l.r>0?'bad':'good'}>{l.r>0?'✖':'✔'} {l.fb}</div>)}</div>
    <button className="go" onClick={again}>תרגיל חוזר</button></div>;
}
