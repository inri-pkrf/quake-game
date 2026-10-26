import React, { useEffect, useRef } from 'react';
const B = process.env.PUBLIC_URL + '/img/';
const I=(k,l)=>Object.fromEntries(l.map(s=>[s,B+k+'_'+s+'.jpg']));
export const IMG = {
  office:I('office',['before','mid','during','strong','after','medic']),
  corridor:I('corridor',['before','mid','after']),
  stairs:I('stairs',['before','mid','after']),
  outside:I('outside',['mid','after','rubble','gather','count','missing']),
  garage:I('garage',['before','mid','debris','wall','after','collapse']),
  elevator:I('elevator',['before','after'])};
const POS = {};
export const RATIOS = {};
export const frameOf=(kind,stage,full)=>{
  const url=IMG[kind][IMG[kind][stage]?stage:'after'], r=RATIOS[url]||.5625;
  if(!full) return {top:0,h:910,r,url};
  return r<.8?{top:0,h:1920,r,url}:{top:410,h:1100,r,url};
};
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
export const project=(kind,stage,u,v)=>{ // מיקום נקודה על המסך במצב הגדול
  const F=frameOf(kind,stage,true), eff=IMG[kind][stage]?stage:'after', [px,py]=(POS[kind+'_'+eff]||'50% 50%').split(' ').map(x=>parseFloat(x)/100);
  const s0=Math.max(1080/F.r,F.h), w=F.r*s0, h=s0, x=(1080-w)*px+u*w, y=F.top+(F.h-h)*py+v*h;
  return {x:cl(540+(x-540)*1.03,90,990), y:cl(960+(y-960)*1.03,200,1720)};
};
const R = (a,b)=>a+Math.random()*(b-a);

export default function Scene({kind,stage,lvl,fade=.5,full}) {
  const cam=useRef(), cv=useRef(), flk=useRef(), L=useRef(lvl), ST=useRef(stage), K=useRef(kind);
  L.current=lvl; ST.current=stage; K.current=kind;
  useEffect(()=>{
    const g=cv.current.getContext('2d'); const P=[]; const acc={}; let raf, last=performance.now(), t0=last, amp=0, ramp=0, nextImp=0, flkUntil=0; const imp={x:0,y:0,r:0};
    const rate={dust:[0,40,120,300],puff:[0,.3,1.2,3.5],glint:[0,0,4,12]};
    const spawn=(t)=>{
      if(P.length>420)return; const out=K.current==='outside';
      if(t==='dust'){const f=Math.random()<.35;P.push({t,x:R(0,1080),y:-10,vx:R(-25,25),vy:f?R(250,550):R(30,130),r:f?R(.8,1.8):R(1,3.6),a:R(.25,.6),life:R(8,14)});}
      if(t==='chunk')P.push({t,x:R(0,1080),y:-30,vx:R(-60,60),vy:R(100,500),g:1500,w:R(5,out?14:26),h:R(4,16),rot:R(0,6),vr:R(-9,9),c:['#cfcabd','#8f8b82','#e8e4d8','#5b5851'][(Math.random()*4)|0],life:6});
      if(t==='paper'&&!out)P.push({t,x:R(60,1020),y:-30,vx:R(-90,90),vy:R(110,260),w:22,h:30,rot:R(0,6),vr:R(-5,5),life:9});
      if(t==='tile'&&!out)P.push({t,x:R(60,1020),y:-90,vx:R(-30,30),vy:R(200,400),g:1600,w:R(90,150),h:R(55,80),rot:0,vr:R(-3,3),life:3});
      if(t==='puff')P.push({t,x:R(0,1080),y:R(1300,1950),vx:R(-20,20),vy:R(-70,-30),r:R(160,320),a:R(.18,.34),life:R(3,5.5),l0:5});
      if(t==='glint'&&!out)P.push({t,x:R(0,1080),y:R(-20,900),vx:R(-80,80),vy:R(400,900),g:900,life:R(.25,.6),l0:.5});
    };
    const loop=(now)=>{
      const dt=Math.min(.05,(now-last)/1000); last=now; const t=(now-t0)/1000, l=L.current, w=2*Math.PI;
      amp+=([0,5,16,38][l]-amp)*.04; ramp+=([0,.12,.4,1][l]-ramp)*.04;
      if(l>=2&&now>nextImp){imp.x=R(-1.2,1.2)*amp;imp.y=R(-.9,.9)*amp;imp.r=R(-1.2,1.2)*ramp;nextImp=now+(l===3?90:180)+R(0,120);}
      imp.x*=.86;imp.y*=.86;imp.r*=.86;
      const sx=amp*(Math.sin(t*w*7.3)*.6+Math.sin(t*w*11.1+1)*.4)+imp.x, sy=amp*.7*(Math.sin(t*w*8.7+2)*.6+Math.sin(t*w*13.3)*.4)+imp.y, sr=ramp*Math.sin(t*w*5.1)*.7+imp.r;
      cam.current.style.transform=`translate(${sx+Math.sin(t*.35)*9}px,${sy+Math.cos(t*.27)*7}px) rotate(${sr}deg) scale(${1.03+.01*Math.sin(t*.2)+amp*.0024})`;
      cam.current.style.filter=amp>12?`blur(${(amp/38*1.8).toFixed(2)}px)`:'none';
      if(l>=1&&now>flkUntil&&Math.random()<(l>=2?.05:.01))flkUntil=now+60+R(0,140);
      flk.current.style.opacity=now<flkUntil?(.3+Math.random()*.5):0;
      const calm=ST.current==='before'&&l===0;
      Object.keys(rate).forEach(k=>{ let r=rate[k][l]; if(k==='dust'&&l===0)r=calm?0:6; if(l===0&&calm)r=0; acc[k]=(acc[k]||0)+r*dt; while(acc[k]>=1){acc[k]--;spawn(k);} });
      g.clearRect(0,0,1080,1920);
      for(let i=P.length-1;i>=0;i--){const p=P[i]; p.life-=dt; if(p.g)p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.rot+=(p.vr||0)*dt;
        if(p.life<=0||p.y>2000){P.splice(i,1);continue;}
        if(p.t==='dust'){g.fillStyle=`rgba(232,222,200,${p.a})`;g.beginPath();g.arc(p.x,p.y,p.r,0,w);g.fill();}
        else if(p.t==='puff'){const a=p.a*Math.min(1,p.life/p.l0*2),rr=p.r*(1+(p.l0-p.life)*.12),gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);gr.addColorStop(0,`rgba(205,195,175,${a})`);gr.addColorStop(1,'rgba(205,195,175,0)');g.fillStyle=gr;g.fillRect(p.x-rr,p.y-rr,rr*2,rr*2);}
        else if(p.t==='glint'){g.strokeStyle=`rgba(210,230,255,${Math.min(1,p.life/p.l0)})`;g.lineWidth=2;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+p.vx*.025,p.y+p.vy*.025);g.stroke();}
        else{g.save();g.translate(p.x,p.y);g.rotate(p.rot);
          if(p.t==='paper'){g.scale(1,Math.abs(Math.cos(p.rot*1.3))+.05);p.vx=Math.sin(t*3+p.x)*80;g.fillStyle='#efede4';g.fillRect(-p.w/2,-p.h/2,p.w,p.h);}
          else if(p.t==='tile'){g.fillStyle='#d6d4cb';g.strokeStyle='#8d8b83';g.lineWidth=3;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.strokeRect(-p.w/2,-p.h/2,p.w,p.h);}
          else{g.fillStyle=p.c;g.fillRect(-p.w/2,-p.h/2,p.w,p.h);}
          g.restore();}
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf);
  },[]);
  const eff=IMG[kind][stage]?stage:'after'; const F=frameOf(kind,stage,full);
  return (
  <div className={'scene'+(full?' full':'')} style={{'--fade':fade+'s'}}>
    <div className="cam" ref={cam}>
      <img alt="" className="bgfill" src={F.url} style={{opacity:full&&F.h<1920?1:0}}/>
      <div className="frame" style={{top:F.top,height:F.h}}>
      {Object.keys(IMG).flatMap(k=>Object.keys(IMG[k]).map(s=>
        <img key={k+s} alt="" className={'layer'+(k===kind&&s===eff?' on':'')} src={IMG[k][s]} style={{objectPosition:POS[k+'_'+s]||'50% 50%'}}/>))}
      </div>
    </div>
    <div className={'haze'+(eff==='before'?'':' show')}/>
    <canvas ref={cv} width="1080" height="1920" className="fx"/>
    <div className="flk" ref={flk}/><div className="vig"/><div className="grain"/>
  </div>);
}
