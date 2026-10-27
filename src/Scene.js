import React, { memo, useEffect, useRef, useState } from 'react';

const B = process.env.PUBLIC_URL + '/img/';
const I = (k, l) => Object.fromEntries(l.map(s => [s, B + k + '_' + s + '.jpg']));
export const IMG = {
  office: I('office', ['before', 'mid', 'during', 'strong', 'after', 'medic', 'door_mid', 'door_during', 'alone', 'phone']),
  corridor: I('corridor', ['before', 'mid', 'after', 'cover', 'injured']),
  stairs: I('stairs', ['before', 'mid', 'after']),
  outside: I('outside', ['mid', 'after', 'rubble', 'gather', 'count', 'missing']),
  garage: I('garage', ['before', 'mid', 'debris', 'wall', 'after', 'collapse']),
  elevator: I('elevator', ['before', 'after'])
};

// תמונות שעדיין חסרות: עד שמוסיפים את הקובץ ל-public/img (בדיוק בשם הזה), מוצגת התמונה שמופיעה כאן.
// ברגע שהקובץ קיים הוא מוצג אוטומטית. הרשימה המלאה בקובץ MISSING_IMAGES.md
const FALLBACK = {};
export const stageOf = (kind, stage) => ((IMG[kind] || IMG.office)[stage] ? stage : 'after');
export const urlOf = (kind, stage) => (IMG[kind] || IMG.office)[stageOf(kind, stage)];
export const fallbackOf = (kind, stage) => { const k = (IMG[kind] ? kind : 'office') + '_' + stageOf(kind, stage); return FALLBACK[k] ? B + FALLBACK[k] + '.jpg' : null; };
export const ALL_URLS = Object.values(IMG).flatMap(o => Object.values(o));

const cl = (v, a, b) => Math.max(a, Math.min(b, v));
// כל התמונות בגודל המסך (1080x1920) ומוצגות 1:1, לכן המיקום פשוט
export const project = (u, v) => ({ x: cl(u * 1080, 120, 960), y: cl(v * 1920, 280, 1530) });

// חלקיקי נפילה: מחושבים פעם אחת, מונפשים ב-CSS בלבד (transform), בלי JS בכל פריים
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(42);
const COLORS = ['#cfcabd', '#8f8b82', '#e8e4d8', '#5b5851'];
const CHUNKS = Array.from({ length: 12 }, (_, i) => {
  const paper = i % 4 === 3;
  return {
    paper,
    x: Math.round(rnd() * 1030),
    w: paper ? 22 : Math.round(8 + rnd() * 24),
    h: paper ? 30 : Math.round(6 + rnd() * 16),
    dx: Math.round((rnd() - 0.5) * 220),
    rot: Math.round((rnd() - 0.5) * 1000),
    dur: (paper ? 3.2 : 1.5) + rnd() * 1.4,
    delay: -rnd() * 3,
    c: paper ? '#efede4' : COLORS[i % 4]
  };
});

function Scene({ kind, stage, lvl, fade = 0.5, full, drift, lite }) {
  const url = urlOf(kind, stage), eff = stageOf(kind, stage), fb = fallbackOf(kind, stage);
  const [layers, setLayers] = useState(() => [{ id: 0, url, first: true }]);
  const nid = useRef(1);

  // מחליפים תמונה רק אחרי שהיא פוענחה, ושומרים בזיכרון לכל היותר שתי תמונות.
  // אם הקובץ חסר (עדיין לא נוסף), מציגים את תמונת הגיבוי
  useEffect(() => {
    let dead = false, t;
    const show = u => {
      if (dead) return;
      setLayers(ls => (ls[ls.length - 1].url === u ? ls : [...ls, { id: nid.current++, url: u, fade }]));
      clearTimeout(t);
      t = setTimeout(() => !dead && setLayers(ls => (ls.length > 1 ? ls.slice(-1) : ls)), fade * 1000 + 150);
    };
    const load = u => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(u); im.onerror = no; im.src = u; });
    const dec = u => load(u).then(() => u);
    dec(url).then(show, () => (fb ? dec(fb).then(show, () => show(fb)) : show(url)));
    return () => { dead = true; clearTimeout(t); };
  }, [url]); // eslint-disable-line

  const calm = eff === 'before' && lvl === 0;
  const camCls = 'cam' + (full ? '' : ' ask') + (lvl ? ' s' + lvl : '');
  const shkCls = 'shk' + (lvl ? ' k' + lvl : drift && !lite ? ' drift' : '');
  const showFx = !lite && !calm && full;
  const indoor = kind !== 'outside';

  return (
    <div className="scene">
      <div className={camCls}>
        <div className={shkCls}>
          {layers.map(l => (
            <img key={l.id} alt="" className={'layer' + (l.first ? ' first' : ' in')} src={l.url}
              style={l.first ? undefined : { animationDuration: l.fade + 's' }} />
          ))}
        </div>
      </div>
      <div className={'haze' + (eff === 'before' ? '' : ' show')} />
      {showFx && (
        <div className={'fx fx' + lvl}>
          <i className="dust dA" /><i className="dust dB" />
          {lvl >= 2 && CHUNKS.filter(c => indoor || !c.paper).map((c, i) => (
            <i key={i} className={'chunk' + (c.paper ? ' paper' : '')}
              style={{ left: c.x, width: c.w, height: c.h, background: c.c, '--dx': c.dx + 'px', '--r': c.rot + 'deg', animationDuration: c.dur + 's', animationDelay: c.delay + 's' }} />
          ))}
        </div>
      )}
      {!lite && lvl >= 2 && <div className="flk" />}
      <div className="vig" />
    </div>
  );
}

export default memo(Scene);
