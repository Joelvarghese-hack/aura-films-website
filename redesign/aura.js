/* ═══════════════ AURA FILMS · ATLAS MOTION ═══════════════
   Rules this file obeys:
   · every animation guides attention, shows state, or preserves continuity
   · responsiveness outranks smoothness
   · transform and opacity only, never layout properties
   · one token set, no inline magic numbers
   · reduced motion and low-end devices override everything
   ════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  /* ── tokens ── */
  var TOK={
    dur:{instant:.08,fast:.18,normal:.35,slow:.6,crawl:1},
    ease:{smooth:'power3.out',sharp:'power2.inOut',out:'expo.out',linear:'none'},
    css:'cubic-bezier(.22,1,.36,1)'
  };

  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var lowEnd=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory&&navigator.deviceMemory<=4);
  var G=window.gsap,ST=window.ScrollTrigger;
  var useG=!!(G&&ST)&&!reduce;
  var rich=useG&&!lowEnd;                    /* decorative extras only on capable devices */
  if(useG) G.registerPlugin(ST);

  /* ── protect the photographs ── */
  document.addEventListener('contextmenu',function(e){ if(e.target.closest('img,.frame,.gitem,.card,.lb')) e.preventDefault(); });
  document.addEventListener('dragstart',function(e){ if(e.target.tagName==='IMG') e.preventDefault(); });

  /* ── weighted wheel scrolling; touch stays native ── */
  var lenis=null;
  if(window.Lenis&&!reduce){
    root.classList.add('has-lenis');
    lenis=new window.Lenis({lerp:.085,wheelMultiplier:.95,smoothWheel:true,syncTouch:false});
    if(useG){ lenis.on('scroll',ST.update); G.ticker.add(function(t){ lenis.raf(t*1000); }); G.ticker.lagSmoothing(0); }
    else (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function goTo(el){ if(lenis) lenis.scrollTo(el,{offset:-92}); else el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); }

  /* ── a single scroll loop for everything that simply follows the page ── */
  var fns=[],ticking=false;
  function onScroll(fn){ fns.push(fn); }
  function run(){ ticking=false; for(var i=0;i<fns.length;i++) fns[i](); }
  function request(){ if(!ticking){ ticking=true; requestAnimationFrame(run); } }
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request);

  /* ── progress bar: shows where you are ── */
  var bar=document.getElementById('progress');
  if(bar) onScroll(function(){ var h=root.scrollHeight-innerHeight; bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'; });

  /* ── nav gets out of the way going down, returns coming up ── */
  var nav=document.getElementById('nav');
  if(nav){
    var lastY=0;
    onScroll(function(){
      var y=scrollY;
      nav.classList.toggle('scrolled',y>30);
      if(!document.body.classList.contains('drawer-open'))
        nav.classList.toggle('tucked',y>260&&y>lastY+4);
      lastY=y;
    });
  }

  /* ── colour: the page takes the tone of the photograph you are looking at ── */
  (function(){
    var worlds=[].slice.call(document.querySelectorAll('[data-c]'));
    if(!worlds.length) return;
    var read=function(el){ return el.dataset.c.split(',').map(Number); };
    var cur=read(worlds[0]),want=cur.slice(),painting=false;
    function set(c){ document.body.style.backgroundColor='rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')'; }
    function pick(){
      var mid=innerHeight*.5,best=null;
      for(var i=0;i<worlds.length;i++){
        var el=worlds[i]; if(el.classList.contains('card')) continue;
        var r=el.getBoundingClientRect();
        if(r.height===0) continue;
        if(r.top<=mid&&r.bottom>=mid) best=el;
      }
      if(best) want=read(best);
    }
    function paint(){
      var moving=false;
      for(var i=0;i<3;i++){ var d=want[i]-cur[i]; if(Math.abs(d)>.3){ cur[i]+=d*.06; moving=true; } else cur[i]=want[i]; }
      set(cur);
      if(moving) requestAnimationFrame(paint); else painting=false;
    }
    function kick(){ pick(); if(reduce){ cur=want.slice(); set(cur); return; } if(!painting){ painting=true; requestAnimationFrame(paint); } }
    set(cur); onScroll(kick); addEventListener('aura:tone',kick); kick();
  })();

  /* ── reveals: once, with a sweep so nothing can stay hidden ── */
  var rv=[].slice.call(document.querySelectorAll('.reveal,.plate,.gitem'));
  function show(e){ e.classList.add('in'); }
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } });
    },{threshold:0,rootMargin:'0px 0px -7% 0px'});
    rv.forEach(function(e){ io.observe(e); });
    var sweep=function(){ for(var i=0;i<rv.length;i++){ var e=rv[i]; if(!e.classList.contains('in')&&e.getBoundingClientRect().top<innerHeight*.97) show(e); } };
    onScroll(sweep); setTimeout(sweep,1200); addEventListener('load',sweep);
  } else rv.forEach(show);

  /* ── the opening: headline lines rise, deck deals itself in ── */
  (function(){
    var lines=[].slice.call(document.querySelectorAll('.ln>span'));
    if(reduce){ lines.forEach(function(s){ s.style.transform='none'; }); return; }
    if(useG&&lines.length){
      G.set(lines,{yPercent:108});
      G.to(lines,{yPercent:0,duration:TOK.dur.crawl,ease:TOK.ease.out,stagger:.08,delay:.1});
    } else if(lines.length){
      lines.forEach(function(s,i){ s.style.transform='translateY(108%)'; s.style.transition='transform 1.1s '+TOK.css+' '+(.1+i*.09)+'s'; });
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ lines.forEach(function(s){ s.style.transform='none'; }); }); });
    }
  })();

  /* ── plates drift inside their frames: depth, not decoration ── */
  if(rich&&matchMedia('(min-width:700px)').matches){
    G.utils.toArray('.plate .frame').forEach(function(f){
      var img=f.querySelector('img'); if(!img) return;
      G.fromTo(img,{yPercent:-4},{yPercent:4,ease:TOK.ease.linear,
        scrollTrigger:{trigger:f,start:'top bottom',end:'bottom top',scrub:1}});
    });
  }

  /* ── chapter headings arrive word by word ── */
  if(rich){
    G.utils.toArray('.ch-head h2, .pk-head h2, .ghead h2').forEach(function(h){
      if(h.dataset.split) return; h.dataset.split='1';
      var parts=[];
      [].slice.call(h.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function(w){
            if(!w.trim()){ frag.appendChild(document.createTextNode(w)); return; }
            var s=document.createElement('span'); s.className='wd'; s.textContent=w; frag.appendChild(s); parts.push(s);
          });
          h.replaceChild(frag,n);
        } else if(n.nodeType===1){ n.classList.add('wd'); parts.push(n); }
      });
      if(!parts.length) return;
      G.set(parts,{yPercent:104,opacity:0});
      G.to(parts,{yPercent:0,opacity:1,duration:TOK.dur.slow,ease:TOK.ease.out,stagger:.045,
        scrollTrigger:{trigger:h,start:'top 86%',once:true}});
    });
  }

  /* ── the manifesto brightens as you read it ── */
  document.querySelectorAll('.mani-text').forEach(function(p){
    if(reduce) return;
    var ws=[].slice.call(p.querySelectorAll('.w')); if(!ws.length) return;
    p.classList.add('mani-live');
    var lit=function(prog){
      var n=Math.round(Math.max(0,Math.min(1,prog))*ws.length);
      for(var i=0;i<ws.length;i++) ws[i].classList.toggle('on',i<n);
    };
    if(useG) ST.create({trigger:p,start:'top 78%',end:'bottom 58%',scrub:true,onUpdate:function(s){ lit(s.progress); }});
    else { onScroll(function(){ var r=p.getBoundingClientRect(); lit((innerHeight*.82-r.top)/(r.height+innerHeight*.28)); }); request(); }
  });

  /* ── prices count up once, so the number registers ── */
  if(useG){
    G.utils.toArray('.tease-price,.tier-price').forEach(function(el){
      var tn=[].slice.call(el.childNodes).filter(function(n){ return n.nodeType===3&&/\d/.test(n.nodeValue); }).pop();
      if(!tn) return;
      var raw=tn.nodeValue,target=parseInt(raw.replace(/[^\d]/g,''),10);
      if(!target||target>20000) return;
      var money=/\$/.test(raw),o={v:0};
      ST.create({trigger:el,start:'top 90%',once:true,onEnter:function(){
        G.to(o,{v:target,duration:TOK.dur.crawl,ease:'power2.out',
          onUpdate:function(){ tn.nodeValue=(money?'$':'')+Math.round(o.v); },
          onComplete:function(){ tn.nodeValue=raw; }});
      }});
    });
  }

  /* ── primary buttons lean toward the pointer ── */
  if(rich&&fine){
    document.querySelectorAll('.hero-cta .btn-solid,.foot-cta .btn-solid').forEach(function(b){
      var x=G.quickTo(b,'x',{duration:TOK.dur.slow,ease:TOK.ease.smooth}),
          y=G.quickTo(b,'y',{duration:TOK.dur.slow,ease:TOK.ease.smooth});
      function move(e){ var r=b.getBoundingClientRect(); x((e.clientX-(r.left+r.width/2))*.22); y((e.clientY-(r.top+r.height/2))*.32); }
      function out(){ x(0); y(0); }
      b.addEventListener('pointermove',move); b.addEventListener('pointerleave',out); b.addEventListener('blur',out);
    });
  }

  /* ── the photo deck ── */
  (function(){
    var deck=document.getElementById('deck'); if(!deck) return;
    var cards=[].slice.call(deck.querySelectorAll('.card')),n=cards.length; if(!n) return;
    var hero=document.getElementById('top'),num=document.getElementById('deckNum'),cap=document.getElementById('deckCap'),fill=document.getElementById('deckFill');
    var cur=0,prev=-1,timer=null,onScreen=true,hovered=false,DUR=4200;
    var POS=[
      {x:'0%',y:'0%',r:0,s:1,o:1,f:'brightness(1)',z:0,ry:0},
      {x:'7%',y:'-3%',r:5,s:.94,o:.95,f:'brightness(.6)',z:-110,ry:-9},
      {x:'-7%',y:'-5%',r:-6,s:.88,o:.75,f:'brightness(.42)',z:-220,ry:9}
    ],GONE={x:'-42%',y:'5%',r:-12,s:.96,o:0,f:'brightness(1)',z:180,ry:-34},BACK={x:'0%',y:'-7%',r:0,s:.82,o:0,f:'brightness(.4)',z:-320,ry:0};
    function pad(x){ return (x<10?'0':'')+x; }
    function apply(c,p,animate){
      var to={xPercent:parseFloat(p.x),yPercent:parseFloat(p.y),rotate:p.r,scale:p.s,opacity:p.o,filter:p.f,z:p.z||0,rotationY:p.ry||0};
      if(useG&&animate) G.to(c,Object.assign({duration:TOK.dur.crawl,ease:TOK.ease.smooth,overwrite:'auto'},to));
      else if(useG) G.set(c,to);
      else { c.style.transform='translate3d('+p.x+','+p.y+',0) rotate('+p.r+'deg) scale('+p.s+')'; c.style.opacity=p.o; c.style.filter=p.f; }
    }
    function lay(animate){
      for(var i=0;i<n;i++){
        var k=(i-cur+n)%n,p;
        if(i===prev&&prev!==cur) p=GONE; else p=k<3?POS[k]:BACK;
        cards[i].style.zIndex=(i===prev&&prev!==cur)?n+1:n-k;
        cards[i].setAttribute('aria-hidden',k===0?'false':'true');
        apply(cards[i],p,animate);
      }
      var a=cards[cur];
      if(num) num.textContent=pad(cur+1)+' / '+pad(n);
      if(cap) cap.textContent=a.dataset.cap||'';
      if(hero){ hero.dataset.c=a.dataset.c; dispatchEvent(new Event('aura:tone')); }
      if(fill){
        fill.style.transition='none'; fill.style.width='0%';
        if(playing()){ void fill.offsetWidth; fill.style.transition='width '+DUR+'ms linear'; fill.style.width='100%'; }
      }
    }
    function playing(){ return !reduce&&onScreen&&!hovered&&!document.hidden; }
    function schedule(){ clearTimeout(timer); if(playing()) timer=setTimeout(function(){ go(1); },DUR); }
    function go(d){ prev=cur; cur=(cur+d+n)%n; lay(true); schedule(); }
    lay(false); schedule();

    var nx=document.getElementById('deckNext'),pv=document.getElementById('deckPrev');
    if(nx) nx.addEventListener('click',function(){ go(1); });
    if(pv) pv.addEventListener('click',function(){ go(-1); });
    deck.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){ e.preventDefault(); go(1); } else if(e.key==='ArrowLeft'){ e.preventDefault(); go(-1); }
    });
    /* swipe: distance and speed together, never speed alone */
    var sx=0,sy=0,st=0,down=false;
    deck.addEventListener('pointerdown',function(e){ down=true; sx=e.clientX; sy=e.clientY; st=Date.now(); });
    deck.addEventListener('pointerup',function(e){
      if(!down) return; down=false;
      var dx=e.clientX-sx,dy=e.clientY-sy,vel=Math.abs(dx)/Math.max(1,Date.now()-st);
      if(Math.abs(dx)>Math.abs(dy)&&(Math.abs(dx)>48||(Math.abs(dx)>20&&vel>.45))) go(dx<0?1:-1);
      else if(Math.abs(dx)<8&&Math.abs(dy)<8) go(1);
    });
    deck.addEventListener('pointercancel',function(){ down=false; });
    deck.addEventListener('mouseenter',function(){ hovered=true; schedule(); });
    deck.addEventListener('mouseleave',function(){ hovered=false; schedule(); });
    deck.addEventListener('focusin',function(){ hovered=true; schedule(); });
    deck.addEventListener('focusout',function(){ hovered=false; schedule(); });
    document.addEventListener('visibilitychange',schedule);
    if('IntersectionObserver' in window)
      new IntersectionObserver(function(es){ onScreen=es[0].isIntersecting; schedule(); },{threshold:.2}).observe(deck);
  })();

  /* ── Calendly, loaded only when a visitor chooses to book ── */
  var CAL=window.AURA_CALENDLY;
  if(CAL&&/^https:\/\/calendly\.com\//.test(CAL)){
    var calState=0,calPromise=null;
    var loadCalendly=function(){
      if(calState===2) return Promise.resolve(true);
      if(calPromise) return calPromise;
      calState=1;
      calPromise=new Promise(function(res){
        var l=document.createElement('link'); l.rel='stylesheet'; l.href='https://assets.calendly.com/assets/external/widget.css'; document.head.appendChild(l);
        var s=document.createElement('script'); s.src='https://assets.calendly.com/assets/external/widget.js'; s.async=true;
        s.onload=function(){ calState=2; res(!!window.Calendly); };
        s.onerror=function(){ calState=0; calPromise=null; res(false); };
        document.head.appendChild(s);
      });
      return calPromise;
    };
    document.querySelectorAll('.nav-cta').forEach(function(b){
      b.addEventListener('click',function(e){
        e.preventDefault();
        loadCalendly().then(function(ok){
          if(ok&&window.Calendly) window.Calendly.initPopupWidget({url:CAL});
          else location.href=b.getAttribute('href')||'/about#contact';
        });
      });
    });
    document.querySelectorAll('[data-cal-embed]').forEach(function(box){
      var btn=box.querySelector('.cal-load'); if(!btn) return;
      btn.addEventListener('click',function(){
        btn.disabled=true; btn.textContent='Loading calendar…';
        var url=box.getAttribute('data-cal-embed');
        loadCalendly().then(function(ok){
          if(ok&&window.Calendly){
            box.innerHTML='<div class="calendly-inline-widget" style="min-width:300px;height:660px"></div>';
            window.Calendly.initInlineWidget({url:url,parentElement:box.firstChild});
          } else { btn.disabled=false; btn.textContent='Calendar unavailable, email us instead'; }
        });
      });
    });
  }

  /* ── drawer ── */
  var burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
  if(burger&&drawer){
    var setDrawer=function(open){
      drawer.classList.toggle('open',open); document.body.classList.toggle('drawer-open',open);
      burger.setAttribute('aria-expanded',open?'true':'false');
      burger.setAttribute('aria-label',open?'Close menu':'Open menu');
      root.style.overflow=open?'hidden':'';
      if(lenis){ open?lenis.stop():lenis.start(); }
      if(nav&&open) nav.classList.remove('tucked');
    };
    burger.addEventListener('click',function(){ setDrawer(!drawer.classList.contains('open')); });
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setDrawer(false); }); });
    addEventListener('keydown',function(e){ if(e.key==='Escape'&&drawer.classList.contains('open')){ setDrawer(false); burger.focus(); } });
  }

  /* ── section jumper follows you ── */
  (function(){
    var links=[].slice.call(document.querySelectorAll('.jump a')); if(!links.length) return;
    var secs=links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    onScroll(function(){
      var idx=-1;
      for(var i=0;i<secs.length;i++) if(secs[i]&&secs[i].getBoundingClientRect().top<innerHeight*.4) idx=i;
      links.forEach(function(a,i){ a.classList.toggle('on',i===idx); });
    });
  })();

  /* ── FAQ ── */
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var it=q.closest('.faq-item'),a=it.querySelector('.faq-a'),open=it.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight=null; o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){ it.classList.add('open'); a.style.maxHeight=a.scrollHeight+'px'; q.setAttribute('aria-expanded','true'); }
      if(useG) ST.refresh();
    });
  });

  /* ── lightbox ── */
  var items=[].slice.call(document.querySelectorAll('.gitem[data-full]')),lb=document.getElementById('lb');
  if(lb&&items.length){
    var lbImg=document.getElementById('lbImg'),idx=0,opener=null;
    var load=function(t){
      lbImg.classList.remove('show');
      var src=t.dataset.full,alt=(t.querySelector('img')||{}).alt||'',pre=new Image(); pre.src=src;
      var put=function(){ lbImg.src=src; lbImg.alt=alt; requestAnimationFrame(function(){ lbImg.classList.add('show'); }); };
      if(pre.decode) pre.decode().then(put).catch(put); else { pre.onload=put; pre.onerror=put; }
    };
    var open=function(t){ opener=t; idx=items.indexOf(t); lb.classList.add('open'); root.style.overflow='hidden'; if(lenis) lenis.stop(); load(items[idx]); document.getElementById('lbClose').focus(); };
    var close=function(){ lb.classList.remove('open'); lbImg.classList.remove('show'); root.style.overflow=''; if(lenis) lenis.start(); if(opener) opener.focus(); };
    var step=function(d){ idx=(idx+d+items.length)%items.length; load(items[idx]); };
    items.forEach(function(t){
      t.addEventListener('click',function(){ open(t); });
      t.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(t); } });
    });
    document.getElementById('lbClose').addEventListener('click',close);
    document.getElementById('lbPrev').addEventListener('click',function(){ step(-1); });
    document.getElementById('lbNext').addEventListener('click',function(){ step(1); });
    lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
    addEventListener('keydown',function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') close(); else if(e.key==='ArrowLeft') step(-1); else if(e.key==='ArrowRight') step(1);
    });
  }

  /* ── back to top ── */
  var toTop=document.getElementById('toTop');
  if(toTop){
    onScroll(function(){ toTop.classList.toggle('show',scrollY>900); });
    toTop.addEventListener('click',function(){ if(lenis) lenis.scrollTo(0); else scrollTo({top:0,behavior:reduce?'auto':'smooth'}); });
  }

  /* ── contact form ── */
  var cf=document.getElementById('cform');
  if(cf){
    cf.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=document.getElementById('cf-btn'),label=btn.innerHTML;
      btn.classList.add('loading'); btn.textContent='Sending…';
      fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(cf),headers:{Accept:'application/json'}})
        .then(function(r){ return r.json(); })
        .then(function(j){
          if(j.success){ cf.classList.add('sent'); document.getElementById('cformThanks').classList.add('show'); }
          else { btn.classList.remove('loading'); btn.innerHTML=label; alert('Your message could not be sent. Please try again, or email itsaurafilms@gmail.com.'); }
        })
        .catch(function(){ btn.classList.remove('loading'); btn.innerHTML=label; alert('Your message could not be sent. Please check your connection, or email itsaurafilms@gmail.com.'); });
    });
  }

  /* ── depth: the stack, the photographs and the reel respond in 3D ── */
  (function(){
    if(!useG) return;
    var clamp=function(v,a,b){ return v<a?a:v>b?b:v; };

    /* the hero stack tilts toward the cursor on a spring; light slides across the print */
    var deck=document.getElementById('deck'),d3=deck&&deck.querySelector('.deck-3d');
    if(d3){
      if(fine){
        var rx=G.quickTo(d3,'rotationX',{duration:.9,ease:'power3'}),ry=G.quickTo(d3,'rotationY',{duration:.9,ease:'power3'});
        var gl=[].slice.call(deck.querySelectorAll('.card-glare')).map(function(g){ return [G.quickTo(g,'xPercent',{duration:.7,ease:'power3'}),G.quickTo(g,'yPercent',{duration:.7,ease:'power3'})]; });
        deck.addEventListener('pointermove',function(e){
          if(e.pointerType!=='mouse') return;
          var r=deck.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
          deck.classList.add('is-tilting'); rx(-ny*16); ry(nx*20);
          for(var i=0;i<gl.length;i++){ gl[i][0](nx*42); gl[i][1](ny*42); }
        });
        deck.addEventListener('pointerleave',function(){ deck.classList.remove('is-tilting'); rx(0); ry(0); });
      } else {
        /* touch screens: the stack breathes slowly instead, and only while it is on screen */
        G.set(d3,{rotationY:-6,rotationX:3});
        var drift=G.to(d3,{rotationY:6,rotationX:-3,duration:4.5,ease:'sine.inOut',yoyo:true,repeat:-1});
        ST.create({trigger:deck,start:'top bottom',end:'bottom top',onToggle:function(st){ st.isActive?drift.play():drift.pause(); }});
      }
    }

    /* photographs lift out of the page in perspective as they arrive */
    if(rich) G.utils.toArray('.plate').forEach(function(p){
      G.fromTo(p,{rotationX:13,y:80,transformPerspective:1400,transformOrigin:'50% 100%'},
        {rotationX:0,y:0,ease:TOK.ease.linear,scrollTrigger:{trigger:p,start:'top bottom',end:'top 58%',scrub:.6}});
    });

    /* every photograph tilts under the cursor with its own glare */
    if(rich&&fine) G.utils.toArray('.plate .frame, .gitem, .quote-pic, .ab-mask').forEach(function(el){
      el.classList.add('tilt');
      var g=document.createElement('i'); g.className='glare'; g.setAttribute('aria-hidden','true'); el.appendChild(g);
      G.set(el,{transformPerspective:1100});
      var tx=G.quickTo(el,'rotationX',{duration:.7,ease:'power3'}),ty=G.quickTo(el,'rotationY',{duration:.7,ease:'power3'});
      var gx=G.quickTo(g,'xPercent',{duration:.6,ease:'power3'}),gy=G.quickTo(g,'yPercent',{duration:.6,ease:'power3'});
      el.addEventListener('pointerenter',function(){
        /* a gallery tile owns a CSS transform transition for its reveal: hand transform to the tilt once revealed */
        if(el.classList.contains('gitem')&&el.classList.contains('in')) el.style.transition='opacity .9s '+TOK.css;
        el.classList.add('is-tilting');
      });
      el.addEventListener('pointermove',function(e){
        var r=el.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
        tx(-ny*7); ty(nx*9); gx(nx*40); gy(ny*40);
      });
      el.addEventListener('pointerleave',function(){ el.classList.remove('is-tilting'); tx(0); ty(0); });
    });

    /* scrolling speed leans the photo grids a touch, then they settle */
    if(rich&&lenis){
      var leaners=G.utils.toArray('.gal-grid, .ch-pair').map(function(el){ return G.quickTo(el,'skewY',{duration:.55,ease:'power3'}); });
      if(leaners.length) lenis.on('scroll',function(e){ var k=clamp(e.velocity*.045,-2.2,2.2); for(var i=0;i<leaners.length;i++) leaners[i](k); });
    }

    /* the about strip bends into a film reel: cards turn toward you as they cross the middle */
    var sec=document.querySelector('.strip');
    if(sec){
      var view=sec.querySelector('.strip-view'),track=sec.querySelector('.strip-track'),cards=[].slice.call(track.querySelectorAll('.strip-card'));
      var reel=function(){
        var w=view.clientWidth,x=sec.classList.contains('strip--pinned')?G.getProperty(track,'x'):-view.scrollLeft;
        for(var i=0;i<cards.length;i++){
          var c=cards[i],d=clamp((x+c.offsetLeft+c.offsetWidth/2-w/2)/w,-1.2,1.2);
          G.set(c,{rotationY:-d*28,z:-Math.abs(d)*200,transformOrigin:'50% 50%'});
        }
      };
      sec._reel=reel;
      view.addEventListener('scroll',function(){ requestAnimationFrame(reel); },{passive:true});
      addEventListener('resize',reel); reel();
    }
  })();

  /* ── cursor: a ring that trails the pointer and says what a click will do ── */
  (function(){
    if(!useG||!fine) return;
    var ring=document.createElement('div'),lab=document.createElement('div');
    ring.className='cursor is-off'; lab.className='cursor-label'; ring.setAttribute('aria-hidden','true'); lab.setAttribute('aria-hidden','true');
    document.body.appendChild(ring); document.body.appendChild(lab);
    G.set(lab,{xPercent:-50,yPercent:-50});
    var rx=G.quickTo(ring,'x',{duration:.45,ease:'power3'}),ry=G.quickTo(ring,'y',{duration:.45,ease:'power3'});
    var lx=G.quickTo(lab,'x',{duration:.45,ease:'power3'}),ly=G.quickTo(lab,'y',{duration:.45,ease:'power3'});
    var sx=G.quickTo(ring,'scaleX',{duration:.4,ease:'power3'}),sy=G.quickTo(ring,'scaleY',{duration:.4,ease:'power3'});
    var scale=function(v){ sx(v); sy(v); };
    var MEDIA=[['.deck','Drag'],['.gitem','View'],['.strip-card','Open'],['.plate-link','Open'],['.plate .frame','']];
    addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse') return;
      ring.classList.remove('is-off'); rx(e.clientX); ry(e.clientY); lx(e.clientX); ly(e.clientY);
      var t=e.target,label=null;
      for(var i=0;i<MEDIA.length;i++){ if(t.closest&&t.closest(MEDIA[i][0])){ label=MEDIA[i][1]; break; } }
      if(label!==null&&label!==''){ ring.classList.add('is-media'); lab.textContent=label; lab.classList.add('on'); scale(5.2); }
      else if(t.closest&&t.closest('a,button,input,textarea,select,label,[role=button]')){ ring.classList.remove('is-media'); lab.classList.remove('on'); scale(2.6); }
      else { ring.classList.remove('is-media'); lab.classList.remove('on'); scale(label===''?2:1); }
    },{passive:true});
    document.addEventListener('pointerleave',function(){ ring.classList.add('is-off'); lab.classList.remove('on'); });
    addEventListener('blur',function(){ ring.classList.add('is-off'); });
  })();

  /* ── about: the portrait unmasks upward, the work strip travels sideways ── */
  (function(){
    var m=document.querySelector('.ab-mask');
    if(m&&useG){
      var im=m.querySelector('img');
      G.fromTo(m,{clipPath:'inset(100% 0% 0% 0% round 32px)'},{clipPath:'inset(0% 0% 0% 0% round 32px)',duration:1.3,ease:TOK.ease.out,delay:.15});
      if(im) G.fromTo(im,{scale:1.18},{scale:1,duration:1.6,ease:TOK.ease.out,delay:.15});
    }
    var sec=document.querySelector('.strip'); if(!sec) return;
    var view=sec.querySelector('.strip-view'),track=sec.querySelector('.strip-track');
    /* pinning only where scroll is wheel-driven and roomy; touch keeps native swipe */
    if(!(rich&&fine&&matchMedia('(min-width:1024px)').matches)) return;
    sec.classList.add('strip--pinned'); view.removeAttribute('tabindex');
    var dist=function(){ return Math.max(0,track.scrollWidth-view.clientWidth); };
    G.to(track,{x:function(){ return -dist(); },ease:TOK.ease.linear,
      onUpdate:function(){ if(sec._reel) sec._reel(); },
      scrollTrigger:{trigger:sec,start:'top top',end:function(){ return '+='+dist(); },pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}});
  })();

  /* ── page transitions: one continuous surface between pages ── */
  (function(){
    var pt=document.getElementById('pt');
    if(!pt||!useG) return;
    var KEY='aura_pt';
    if(sessionStorage.getItem(KEY)){
      sessionStorage.removeItem(KEY);
      G.set(pt,{scaleY:1,transformOrigin:'50% 0%'});
      G.to(pt,{scaleY:0,duration:TOK.dur.slow,ease:TOK.ease.sharp,transformOrigin:'50% 0%'});
    }
    var leaving=false;
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a'); if(!a||leaving) return;
      var href=a.getAttribute('href');
      if(!href||href.charAt(0)==='#'||a.target==='_blank'||a.hasAttribute('download')) return;
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0) return;
      var url; try{ url=new URL(a.href); }catch(_){ return; }
      if(url.origin!==location.origin) return;
      if(url.pathname===location.pathname){ return; }
      e.preventDefault(); leaving=true;
      try{ sessionStorage.setItem(KEY,'1'); }catch(_){}
      var done=false,gonow=function(){ if(done) return; done=true; location.href=a.href; };
      G.set(pt,{scaleY:0,transformOrigin:'50% 100%'});
      G.to(pt,{scaleY:1,duration:TOK.dur.normal+.1,ease:TOK.ease.sharp,onComplete:gonow});
      setTimeout(gonow,700);                    /* never trap the visitor */
    });
    addEventListener('pageshow',function(e){ if(e.persisted){ leaving=false; G.set(pt,{scaleY:0}); } });
  })();

  /* ── in-page anchors follow the smooth scroller ── */
  if(lenis){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var id=a.getAttribute('href'); if(id.length<2) return;
        var el=document.querySelector(id); if(!el) return;
        e.preventDefault(); goTo(el); history.replaceState(null,'',id);
      });
    });
  }

  if(useG) addEventListener('load',function(){ ST.refresh(); });
  request();
})();
