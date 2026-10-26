import React, { useEffect, useRef, useState } from 'react';
import Scene, { project, ALL_URLS } from './Scene';
import { S, START, endingFor } from './story';
import { H } from './hotspots';
import * as A from './audio';
import { Seismo, FsButton, usePerf, Tick, Cross } from './ui';

const IDLE = 120000, PUB = process.env.PUBLIC_URL, TMAX = 25; // TMAX = שניות להחלטה
const L = (t, stage, lvl) => ({ t, stage, lvl });
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
const sceneOf = (id, risk) => id === 'final' ? {...S.sCount, ...endingFor(risk), o:null} : (S[id] || {});
const planOf = (id, risk) => id === 'final' ? {s:[L(0, endingFor(risk).end === 'bad' ? 'missing' : 'gather', 0)], d:2500} : (PLAN[id] || {s:[L(0,'after',0)], d:1800});

// טוען את כל התמונות ברקע, אחת אחרי השנייה, כדי שהמעברים יהיו חלקים
function usePreload() {
  useEffect(() => {
    let dead = false, i = 0;
    const next = () => { if (dead || i >= ALL_URLS.length) return; const im = new Image(); im.onload = im.onerror = () => setTimeout(next, 30); im.src = ALL_URLS[i++]; };
    const t = setTimeout(next, 600);
    return () => { dead = true; clearTimeout(t); };
  }, []);
}

export default function App() {
  const { lite, fps, debug } = usePerf();
  usePreload();
  const [box, setBox] = useState({ s: 1, x: 0, y: 0 });
  const [id, setId] = useState('attract'), [risk, setRisk] = useState(30), [log, setLog] = useState([]), [pick, setPick] = useState(null);
  const [phase, setPhase] = useState('play'), [lvl, setLvl] = useState(0), [stage, setStage] = useState('before'), [fade, setFade] = useState(.5), [cap, setCap] = useState(''), [tremor, setTremor] = useState(0);
  const [seen, setSeen] = useState({}), [card, setCard] = useState(null), [left, setLeft] = useState(null), [toast, setToast] = useState('');
  const idle = useRef(), R = useRef(risk), pickRef = useRef(false), award = useRef({}), tScan = useRef(), flashEl = useRef(); R.current = risk;

  // התאמת הבמה (1080x1920) למסך, עם מיקום בפיקסלים שלמים כדי שהתמונה תישאר חדה
  useEffect(() => {
    const f = () => {
      const W = window.innerWidth, Hh = window.innerHeight, s = Math.min(W / 1080, Hh / 1920);
      setBox({ s, x: Math.round((W - 1080 * s) / 2), y: Math.round((Hh - 1920 * s) / 2) });
    };
    f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f);
  }, []);

  const reset = () => { A.stop(); setId('attract'); setRisk(30); setLog([]); setPick(null); setLvl(0); setLeft(null); setPhase('play'); award.current = {}; };
  const poke = () => { clearTimeout(idle.current); idle.current = setTimeout(reset, IDLE); };
  useEffect(() => { poke(); return () => clearTimeout(idle.current); }, [id, phase]); // eslint-disable-line
  // הבהוב מסך: אנימציית CSS שמופעלת ישירות, בלי רינדור מחדש
  const fl = () => { const e = flashEl.current; if (!e) return; e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); };

  useEffect(() => { if (id !== 'attract') return; setStage('after'); setFade(1); setLvl(0);
    const run = () => { setTremor(Math.random() < .4 ? 3 : 2); setTimeout(() => setTremor(0), 2400); };
    const a = setTimeout(run, 1500), iv = setInterval(run, 8000);
    return () => { clearTimeout(a); clearInterval(iv); setTremor(0); }; }, [id]);

  useEffect(() => {
    if (id === 'attract') { A.stop(); return; }
    const sc = sceneOf(id, R.current), T = []; const at = (ms, f) => T.push(setTimeout(f, ms));
    const hits = arr => arr.forEach(d => at(d, () => { A.hit(); fl(); }));
    const toNext = () => { if (H[id] && H[id].length && sc.o) setPhase('scan'); else { A.alarm(0); setPhase('ask'); } };
    const done = () => { setLvl(0); A.rumble(0); toNext(); };
    clearTimeout(tScan.current); setSeen({}); setCard(null); setLeft(null); setPick(null); pickRef.current = false;
    setPhase('play');
    if (id === 's1') {
      setFade(.9); setStage('before'); setLvl(0); setCap('יום שלישי, 10:41. קומה 3. יום עבודה רגיל.'); A.ambient(1); A.alarm(0);
      at(3800, () => { setCap('10:42'); setLvl(1); A.rumble(1); A.vib(80); });
      at(5600, () => { setCap('רעידת אדמה'); setFade(.25); setStage('mid'); setLvl(2); A.rumble(2); A.vib([120,60,120]); fl(); });
      at(7600, () => { setCap(''); setFade(.18); setStage('during'); setLvl(3); A.rumble(3); A.vib([300,100,400,100,600]); A.glass(); fl(); hits([900,1700,2500,3400,4300]); });
      at(10800, () => { setFade(.22); setStage('strong'); A.hit(); fl(); });
      at(14000, () => { setLvl(2); A.rumble(2); });
      at(15200, () => { setFade(3); setStage('after'); setLvl(1); A.rumble(1); A.ambient(0); });
      at(16600, () => { setLvl(0); A.rumble(0); A.alarm(1); A.ring(5); setCap('שקט. אבק. אזעקה מרחוק.'); });
      at(19400, toNext);
    } else {
      const pl = planOf(id, R.current), mx = Math.max(...pl.s.map(s => s.lvl)); setCap(sc.title); A.alarm(sc.kind !== 'outside' ? 1 : 0);
      pl.s.forEach((s, i) => { const f = () => { setFade(i === 0 ? .9 : (s.lvl >= 2 ? .18 : 1.6)); setStage(s.stage); setLvl(s.lvl); A.rumble(s.lvl); A.ambient(s.lvl === 0 && i === 0);
        if (s.lvl >= 2) { A.glass(); fl(); A.vib([200,80,300]); hits([500,1400,2400]); } else if (s.lvl === 1 && i > 0) { fl(); A.hit(); } };
        s.t ? at(s.t, f) : f(); });
      at(pl.d, () => { A.ambient(0); if (mx > 0) A.ring(2); done(); });
    }
    return () => T.forEach(clearTimeout);
  }, [id]); // eslint-disable-line

  // טיימר החלטה (בשניות שלמות; הפס עצמו מונפש ב-CSS)
  useEffect(() => { if (phase !== 'ask' || id === 'attract' || !sceneOf(id, R.current).o) return; setLeft(TMAX);
    const iv = setInterval(() => setLeft(l => l === null ? l : Math.max(0, l - 1)), 1000); return () => clearInterval(iv); }, [phase, id]);
  useEffect(() => { if (left !== null && left > 0 && left <= 5) A.tick();
    if (left === 0) { const sc = sceneOf(id, R.current); if (sc.o && !pickRef.current) { let bi = 0; sc.o.forEach((o, i) => { if (o.r > sc.o[bi].r) bi = i; }); choose({...sc.o[bi], fb: 'לא התקבלה החלטה בזמן. ' + sc.o[bi].fb}, bi); } } }, [left]); // eslint-disable-line

  // סריקה: מסיימים אחרי שנגעו בכל הנקודות, או אוטומטית אם אף אחד לא נוגע 16 שניות (אין כפתור דילוג)
  const hs = id !== 'attract' && phase === 'scan' && sceneOf(id, risk).o ? (H[id] || []) : [];
  useEffect(() => { if (hs.length && hs.every((_, i) => seen[i]) && !award.current[id]) { award.current[id] = 1; setRisk(r => Math.max(0, r - 3)); setToast('סריקה מלאה · סיכון −3'); setTimeout(() => setToast(''), 2200); tScan.current = setTimeout(() => { A.alarm(0); setPhase('ask'); }, 3800); } }, [seen]); // eslint-disable-line
  useEffect(() => { if (phase !== 'scan') return; const t = setTimeout(() => { A.alarm(0); setPhase('ask'); }, 16000); return () => clearTimeout(t); }, [phase, seen, card]);

  const start = () => { const q = new URLSearchParams(window.location.search); A.unlock(); setRisk(+q.get('risk') || 30); setLog([]); award.current = {}; setId(S[q.get('scene')] || q.get('scene') === 'final' ? q.get('scene') : START); };
  function choose(o, i) { if (pickRef.current) return; pickRef.current = true; setPick(i); setLeft(null); setCard(null); A.vib(40); setTimeout(() => {
    const nr = Math.max(0, Math.min(100, R.current + o.r)); setRisk(nr); setLog(l => [...l, {t: o.t, fb: o.fb, r: o.r}]);
    setId(o.n === 'END' ? 'final' : o.n); }, 900); }
  const openHs = i => { A.tick(); setSeen(s => ({...s, [i]: 1})); setCard(i); };
  const sc = sceneOf(id, risk), ask = phase === 'ask', cnt = hs.filter((_, i) => seen[i]).length;
  const col = risk < 35 ? '#43b581' : risk < 65 ? '#f0b83a' : '#e8553f';
  return (
  <div className={'wrap' + (lite ? ' lite' : '')} onPointerDown={poke} onContextMenu={e => e.preventDefault()}>
   <div className="stage" style={{ left: box.x, top: box.y, transform: `scale(${box.s})` }}>
   {id === 'attract' ? (
    <div className="attract" onClick={start}>
     <Scene kind="stairs" stage="after" lvl={tremor} fade={1} full drift lite={lite} />
     <div className="shade a" />
     <div className="atxt">
      <div className="badge">הכשרת קב"טים · יום ממוקד רעידת אדמה</div>
      <h1><span>החלטה אחת</span><span className="g">משנה הכול</span></h1>
      <div className="rule" />
      <p>רעידת אדמה. שניות להחליט.</p>
      <Seismo lvl={tremor} className="seisA" lite={lite} />
      <button className="go"><span>לחצו להתחלה</span></button>
      <div className="hint">מומלץ להפעיל קול</div>
     </div>
    </div>
   ) : (<>
    <Scene kind={sc.kind} stage={stage} lvl={lvl} fade={fade} full={phase !== 'ask'} lite={lite} />
    <div className={'playui' + (phase === 'play' ? '' : ' hide')}>
      <div className="shade" />
      <div className="live"><span className="dot" />מד רעידות · עוצמה <b>{['—','3.0','5.5','7.0'][lvl]}</b></div>
      <div className="cap" key={cap}>{cap}</div>
      {phase === 'play' && <Seismo lvl={lvl} className="seisP" lite={lite} />}
    </div>
    <div className="flash" ref={flashEl} />
    {phase === 'scan' && <>
      {hs.map((h, i) => { const p = project(h.u, h.v); return <button key={i} className={'hs' + (seen[i] ? ' seen' : '')} style={{ left: p.x - 60, top: p.y - 60 }} onClick={() => openHs(i)}><i /></button>; })}
      {card !== null && hs[card] && (() => { const p = project(hs[card].u, hs[card].v), rt = p.x > 540, st = { top: Math.max(160, Math.min(1600, p.y - 70)) };
        if (rt) st.right = 1080 - p.x + 64; else st.left = p.x + 64;
        return <div className={'hcard ' + (rt ? 'rt' : 'lf')} style={st} key={card} onClick={() => setCard(null)}>{hs[card].t}</div>; })()}
      {toast && <div className="toast">{toast}</div>}
      <div className="scanui"><div className="shade" /><div className="scap">גע בנקודות הזהובות כדי לסרוק את הזירה <span>{cnt}/{hs.length}</span></div></div>
    </>}
    {ask && <>
      <div className="top"><div className="ttl">{sc.title}</div><div className="sec">+{sc.sec} שנ' מתחילת הרעידה</div></div>
      <div className="hud"><span>רמת סיכון</span><div className="bar"><div style={{ transform: `scaleX(${Math.max(.001, risk / 100)})`, background: col }} /></div><b style={{ color: col }}>{risk}</b></div>
      <div className="panel in">
       {sc.o && left !== null && <div className={'tmr' + (left <= 7 ? ' low' : '')}><i key={id} style={{ animationDuration: TMAX + 's' }} /></div>}
       {sc.o && <div className="q">מה אתה עושה? {left !== null && <span className={left <= 7 ? 'low' : ''}>{left}</span>}</div>}
       <p className="story">{sc.text}</p>
       {sc.o && sc.o.map((o, i) => <button key={i} className={'opt' + (pick === i ? ' picked' : '') + (pick !== null && pick !== i ? ' dim' : '')} onClick={() => choose(o, i)}><span className="num">{i + 1}</span><span>{o.t}</span></button>)}
       {sc.end && <Summary log={log} end={sc.end} risk={risk} again={reset} />}
      </div></>}
   </>)}
   <img className="logo" src={PUB + '/logo.svg'} alt="" />
   <FsButton />
   </div>
   {debug && <div className="dbg">{window.innerWidth}×{window.innerHeight} · dpr {window.devicePixelRatio} · scale {box.s.toFixed(2)} · {fps} fps · {lite ? 'LITE' : 'FULL'}</div>}
  </div>);
}
function Summary({ log, end, risk, again }) {
  const lab = {good:'ביצוע מצוין', ok:'ביצוע סביר, יש מה לשפר', bad:'נדרש תרגול נוסף'}[end];
  return <div className="sum"><div className={'verdict ' + end}><span>{lab}</span><b>סיכון סופי {risk}</b></div>
    <div className="lessons">{log.slice(-5).map((l, i) => <div key={i} className={l.r > 0 ? 'bad' : 'good'}>{l.r > 0 ? <Cross /> : <Tick />}<span>{l.fb}</span></div>)}</div>
    <button className="go" onClick={again}><span>תרגיל חוזר</span></button></div>;
}
