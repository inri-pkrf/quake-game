// צלילים מסונתזים (WebAudio) - ללא קבצי שמע חיצוניים
let ctx, master, rF, rG, lfoG, sub, amb, nbuf, alarmT, alarmO, alarmG;
const noise = () => {
  if (!nbuf) { const n = ctx.sampleRate * 2; nbuf = ctx.createBuffer(1, n, ctx.sampleRate); const d = nbuf.getChannelData(0); let l = 0;
    for (let i = 0; i < n; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } }
  const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; return s;
};
const ramp = (p, v, t = 0.3) => p.setTargetAtTime(v, ctx.currentTime, t);
export function unlock() {
  if (ctx) { ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  ctx = new C(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const s = noise(); rF = ctx.createBiquadFilter(); rF.type = 'lowpass'; rF.frequency.value = 100;
  rG = ctx.createGain(); rG.gain.value = 0; s.connect(rF); rF.connect(rG); rG.connect(master); s.start();
  const lfo = ctx.createOscillator(); lfo.frequency.value = 7; lfoG = ctx.createGain(); lfoG.gain.value = 0; lfo.connect(lfoG); lfoG.connect(rG.gain); lfo.start();
  const o = ctx.createOscillator(); o.frequency.value = 36; sub = ctx.createGain(); sub.gain.value = 0; o.connect(sub); sub.connect(master); o.start();
  const a = noise(), af = ctx.createBiquadFilter(); af.type = 'bandpass'; af.frequency.value = 450; amb = ctx.createGain(); amb.gain.value = 0;
  a.connect(af); af.connect(amb); amb.connect(master); a.start();
}
export const rumble = (l) => { if (!ctx) return;
  ramp(rG.gain, [0, .4, .9, 1.6][l]); ramp(rF.frequency, [80, 140, 230, 340][l]); ramp(sub.gain, [0, .15, .45, .8][l]); ramp(lfoG.gain, [0, .05, .25, .6][l]); };
export const ambient = (on) => { if (ctx) ramp(amb.gain, on ? 0.25 : 0, 1); };
export const hit = () => { if (!ctx) return;
  const t = ctx.currentTime, s = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  f.type = 'bandpass'; f.frequency.value = 700 + Math.random() * 600; g.gain.setValueAtTime(1.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.8);
  const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.4);
  og.gain.setValueAtTime(1, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.5); o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.6); };
export const glass = () => { if (!ctx) return;
  for (let i = 0; i < 9; i++) { const t = ctx.currentTime + i * 0.06 + Math.random() * 0.05, s = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'highpass'; f.frequency.value = 3500 + Math.random() * 3000; g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.2); } };
export const ring = (sec = 5) => { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = 3200; g.gain.setValueAtTime(0.05, t); g.gain.linearRampToValueAtTime(0, t + sec); o.connect(g); g.connect(master); o.start(t); o.stop(t + sec); };
export const alarm = (on) => { if (!ctx) return; clearInterval(alarmT);
  if (alarmO) { try { alarmO.stop(); } catch (e) {} alarmO = null; }
  if (!on) return; alarmO = ctx.createOscillator(); alarmO.type = 'square'; alarmG = ctx.createGain(); alarmG.gain.value = 0.025;
  alarmO.connect(alarmG); alarmG.connect(master); alarmO.start(); let h = 0;
  alarmT = setInterval(() => { h = !h; if (alarmO) alarmO.frequency.value = h ? 880 : 660; }, 450); };
export const stop = () => { if (!ctx) return; rumble(0); ambient(0); alarm(0); };
export const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
export const tick = () => { if (!ctx) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = 1000; g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.1); };
