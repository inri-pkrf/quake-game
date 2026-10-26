import React, { useEffect, useRef, useState } from 'react';

const qs = () => new URLSearchParams(window.location.search);

// גרף רעידות: מעדכן ישירות את ה-SVG, בלי רינדור מחדש של React
export function Seismo({ lvl, className, lite }) {
  const poly = useRef(), pts = useRef(Array(100).fill(0)), L = useRef(lvl);
  L.current = lvl;
  useEffect(() => {
    const draw = () => {
      const a = pts.current; a.shift();
      a.push((Math.random() * 2 - 1) * [3, 10, 38, 90][L.current]);
      if (poly.current) poly.current.setAttribute('points', a.map((v, i) => `${i * 10},${100 + v}`).join(' '));
    };
    draw();
    const iv = setInterval(draw, lite ? 100 : 50);
    return () => clearInterval(iv);
  }, [lite]);
  return (
    <svg viewBox="0 0 1000 200" className={className} preserveAspectRatio="none">
      <polyline ref={poly} fill="none" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" stroke={lvl > 1 ? '#e8553f' : '#f0b83a'} />
    </svg>
  );
}

const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
export function FsButton() {
  const [on, setOn] = useState(!!fsEl());
  useEffect(() => {
    const f = () => setOn(!!fsEl());
    document.addEventListener('fullscreenchange', f); document.addEventListener('webkitfullscreenchange', f);
    return () => { document.removeEventListener('fullscreenchange', f); document.removeEventListener('webkitfullscreenchange', f); };
  }, []);
  const el = document.documentElement;
  if (!(el.requestFullscreen || el.webkitRequestFullscreen)) return null;
  const toggle = e => {
    e.stopPropagation();
    try {
      if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } catch (err) { /* ignore */ }
  };
  return (
    <button className={'fsb' + (on ? ' on' : '')} onClick={toggle} aria-label={on ? 'יציאה ממסך מלא' : 'מסך מלא'}>
      {on
        ? <svg viewBox="0 0 24 24"><path d="M9 3v5a1 1 0 0 1-1 1H3M15 3v5a1 1 0 0 0 1 1h5M9 21v-5a1 1 0 0 0-1-1H3M15 21v-5a1 1 0 0 1 1-1h5" /></svg>
        : <svg viewBox="0 0 24 24"><path d="M3 9V4a1 1 0 0 1 1-1h5M21 9V4a1 1 0 0 0-1-1h-5M3 15v5a1 1 0 0 0 1 1h5M21 15v5a1 1 0 0 1-1 1h-5" /></svg>}
    </button>
  );
}

// בודק את קצב הפריימים. אם המכשיר חלש, עובר אוטומטית למצב "קל" (בלי חלקיקים וזום איטי).
// ?lite=1 כופה מצב קל, ?hq=1 מבטל את המעבר האוטומטי, ?debug=1 מציג נתונים על המסך.
export function usePerf() {
  const q = qs();
  const forceLite = q.has('lite') && q.get('lite') !== '0', forceHq = q.has('hq') || forceLite, debug = q.has('debug');
  const [lite, setLite] = useState(forceLite);
  const [fps, setFps] = useState(0);
  useEffect(() => {
    if (lite && !debug) return;
    let raf, last = 0, buf = [], slow = 0, born = performance.now();
    const loop = t => {
      if (last && t - last < 500) buf.push(t - last);
      last = t;
      if (buf.length >= 90) {
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length; buf = [];
        setFps(Math.round(1000 / avg));
        if (!forceHq && t - born > 2500) { slow = avg > 30 ? slow + 1 : 0; if (slow >= 2) setLite(true); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [lite]); // eslint-disable-line
  return { lite, fps, debug };
}

export const Tick = () => <svg viewBox="0 0 24 24" className="ico"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const Cross = () => <svg viewBox="0 0 24 24" className="ico"><path d="M6 6l12 12M18 6L6 18" /></svg>;
