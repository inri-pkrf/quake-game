import React from 'react';
const Dust = () => <>{Array.from({length:26}).map((_,i)=><i key={i} className="dust" style={{left:(i*37%100)+'%',animationDelay:(i%9)*-1.3+'s',animationDuration:6+(i%7)+'s',width:2+(i%4),height:2+(i%4)}}/>)}</>;
export default function Scene({kind,shake,risk}) {
  const dark = Math.min(.55, risk/180);
  return (
  <div className={'scene shake'+shake}>
   <svg viewBox="0 0 1080 900" preserveAspectRatio="xMidYMid slice">
    <defs>
     <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a8d90"/><stop offset="1" stopColor="#5d6063"/></linearGradient>
     <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3d40"/><stop offset="1" stopColor="#1a1b1d"/></linearGradient>
     <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a5a80"/><stop offset=".6" stopColor="#d79b6b"/><stop offset="1" stopColor="#e8c08a"/></linearGradient>
     <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9fc4e6" stopOpacity=".7"/><stop offset="1" stopColor="#2b4d70" stopOpacity=".9"/></linearGradient>
     <radialGradient id="lamp"><stop offset="0" stopColor="#fff7d6" stopOpacity=".9"/><stop offset="1" stopColor="#fff7d6" stopOpacity="0"/></radialGradient>
     <filter id="rough"><feTurbulence baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
     <filter id="blur"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    {kind==='office' && <g>
      <rect width="1080" height="900" fill="url(#wall)"/>
      <rect y="0" width="1080" height="110" fill="#c9cbcc"/>
      {[0,1,2].map(i=><g key={i}><rect x={120+i*340} y="40" width="260" height="26" fill="#f3f1e6"/><ellipse className={i===1?'flick':''} cx={250+i*340} cy="150" rx="230" ry="110" fill="url(#lamp)" opacity=".55"/></g>)}
      <rect x="60" y="150" width="520" height="360" fill="url(#sky)"/><rect x="60" y="150" width="520" height="360" fill="url(#glass)"/>
      {[0,1,2,3,4,5].map(i=><rect key={i} x={80+i*80} y={400-((i*53)%140)} width="55" height={110+((i*53)%140)} fill="#2a3340" opacity=".85"/>)}
      <path d="M320 150 L350 260 L310 330 L340 420 L320 510" stroke="#111" strokeWidth="3" fill="none" opacity=".7"/>
      <path d="M60 150h520M320 150v360M60 330h520" stroke="#2c2f32" strokeWidth="10"/>
      <rect x="640" y="150" width="330" height="360" fill="#6e7174"/><rect x="660" y="170" width="290" height="320" fill="#d6d2c4" opacity=".85"/>
      <path d="M700 190l60 70 -20 40 50 60M900 400l-40 -70" stroke="#3a3a3a" strokeWidth="3" fill="none"/>
      <rect y="560" width="1080" height="340" fill="url(#floor)"/>
      <path d="M0 620H1080M0 720H1080M0 840H1080" stroke="#000" opacity=".3"/>
      {[[80,600],[560,640]].map(([x,y],i)=><g key={i}><rect x={x} y={y} width="440" height="30" fill="#7b5a3c"/><rect x={x+20} y={y+30} width="14" height="190" fill="#222"/><rect x={x+406} y={y+30} width="14" height="190" fill="#222"/><rect x={x+130} y={y-150} width="170" height="120" rx="8" fill="#15191e"/><rect x={x+140} y={y-140} width="150" height="100" fill="#3b5d7f" opacity=".75"/><rect x={x+205} y={y-30} width="20" height="30" fill="#222"/></g>)}
      <g transform="rotate(-18 820 780)"><rect x="740" y="740" width="160" height="90" fill="#2a2d31"/></g>
      <path d="M200 110l90 0 20 60-110 0z" fill="#b8b6ac" opacity=".9"/>
    </g>}
    {kind==='corridor' && <g>
      <rect width="1080" height="900" fill="#26282a"/>
      <polygon points="0,0 1080,0 700,300 380,300" fill="#aaa" /><polygon points="0,0 380,300 380,620 0,900" fill="url(#wall)"/>
      <polygon points="1080,0 700,300 700,620 1080,900" fill="url(#wall)" opacity=".85"/><polygon points="0,900 380,620 700,620 1080,900" fill="url(#floor)"/>
      <rect x="380" y="300" width="320" height="320" fill="#0d0e0f"/>
      <rect x="480" y="330" width="120" height="50" fill="#18c76b" /><path d="M495 355h70M545 340l20 15-20 15" stroke="#fff" strokeWidth="6" fill="none"/>
      <ellipse cx="540" cy="620" rx="200" ry="26" fill="#18c76b" opacity=".25"/>
      <polygon points="140,170 330,300 330,560 140,640" fill="#4d4f52" stroke="#222"/><polygon points="800,300 960,180 960,640 800,560" fill="#4d4f52" stroke="#222"/>
      <polygon points="460,110 640,110 620,60 480,60" fill="#d5d3c9"/>
      <path d="M620 300 600 360 650 420" stroke="#111" strokeWidth="3" fill="none"/>
    </g>}
    {kind==='stairs' && <g>
      <rect width="1080" height="900" fill="#2a2c2e"/><rect width="1080" height="900" fill="url(#wall)" opacity=".6"/>
      {Array.from({length:12}).map((_,i)=><g key={i}><polygon points={`${80+i*70},${820-i*50} ${150+i*70},${820-i*50} ${150+i*70},${870-i*50} ${80+i*70},${870-i*50}`} fill={i%2?'#6a6d70':'#797c7f'}/></g>)}
      <polygon points="80,860 920,260 920,300 80,900" fill="#222"/><path d="M80 780 920 180" stroke="#cfd1d2" strokeWidth="10"/>
      <path d="M760 60 700 200 780 330 720 460 800 600" stroke="#0a0a0a" strokeWidth="6" fill="none"/>
      <rect x="860" y="60" width="150" height="60" fill="#18c76b"/><rect x="480" y="20" width="200" height="20" fill="#fffbe0" className="flick"/>
    </g>}
    {kind==='outside' && <g>
      <rect width="1080" height="900" fill="url(#sky)"/>
      {[0,1,2,3,4,5,6,7].map(i=><rect key={i} x={i*140-20} y={260-((i*71)%170)} width="130" height={380+((i*71)%170)} fill={i%2?'#4a5360':'#3a424d'}/>)}
      {Array.from({length:60}).map((_,i)=><rect key={i} x={(i*97)%1060} y={300+((i*61)%320)} width="14" height="18" fill="#f5d98f" opacity=".5"/>)}
      <rect y="620" width="1080" height="280" fill="url(#floor)"/><path d="M0 700 1080 700M0 800H1080" stroke="#aaa" strokeDasharray="60 40" opacity=".4"/>
      <ellipse cx="540" cy="640" rx="620" ry="90" fill="#caa57a" opacity=".35" filter="url(#blur)"/>
      {[0,1,2,3,4,5,6].map(i=><g key={i} transform={`translate(${220+i*95},${690+(i%3)*30})`}><circle cy="-48" r="14" fill="#222"/><rect x="-14" y="-34" width="28" height="64" rx="10" fill={['#d8572a','#2d6cdf','#e0b43a','#aaa'][i%4]}/></g>)}
    </g>}
    <rect width="1080" height="900" filter="url(#rough)" opacity=".7"/>
    <rect width="1080" height="900" fill="#000" opacity={dark}/>
    {shake>=2 && <rect width="1080" height="900" fill="#ff3b1d" opacity=".06" className="flick"/>}
   </svg>
   <Dust/><div className="vig"/>
  </div>);
}
