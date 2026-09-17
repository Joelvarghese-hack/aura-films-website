/* ═══════════════════ AURA FILMS · ATLAS BEHAVIOUR ═══════════════════ */
(function(){
  "use strict";
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement;

  /* deter casual image saving */
  document.addEventListener('contextmenu',function(e){ if(e.target.closest('img,.frame,.gitem,.card,.lb')) e.preventDefault(); });
  document.addEventListener('dragstart',function(e){ if(e.target.tagName==='IMG') e.preventDefault(); });

  /* ── weighted wheel scrolling on desktop; touch stays native ── */
  var lenis=null;
  if(window.Lenis && !reduce){
    root.classList.add('has-lenis');
    lenis=new window.Lenis({duration:1.1,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true,syncTouch:false});
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function goTo(el){ if(lenis) lenis.scrollTo(el,{offset:-90}); else el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'}); }

  /* ── one scroll loop for everything that follows the page ── */
  var ticking=false,onScrollFns=[];
  function onScroll(fn){ onScrollFns.push(fn); }
  function frame(){ ticking=false; for(var i=0;i<onScrollFns.length;i++) onScrollFns[i](); }
  function request(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
  addEventListener('scroll',request,{passive:true}); addEventListener('resize',request);

  /* progress bar */
  var bar=document.getElementById('progress');
  if(bar) onScroll(function(){
    var h=root.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';
  });

  /* ── colour: the page takes the tone of whatever photograph you are looking at ── */
  (function(){
    var worlds=[].slice.call(document.querySelectorAll('[data-c]'));
    if(!worlds.length) return;
    function read(el){ return el.dataset.c.split(',').map(Number); }
    var cur=read(worlds[0]),want=cur.slice();
    function pick(){
      var mid=innerHeight*0.5,best=null;
      for(var i=0;i<worlds.length;i++){
        var el=worlds[i]; if(el.classList.contains('card')) continue;   /* deck cards steer the hero instead */
        var r=el.getBoundingClientRect();
        if(r.height===0) continue;
        if(r.top<=mid && r.bottom>=mid) best=el;
      }
      if(best) want=read(best);
    }
    function set(c){ document.body.style.backgroundColor='rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')'; }
    set(cur);
    if(reduce){ onScroll(function(){ pick(); set(want); }); addEventListener('aura:tone',function(){ pick(); set(want); }); pick(); set(want); return; }
    function paint(){
      var moving=false;
      for(var i=0;i<3;i++){ var d=want[i]-cur[i]; if(Math.abs(d)>0.3){ cur[i]+=d*0.06; moving=true; } else cur[i]=want[i]; }
      set(cur);
      if(moving) requestAnimationFrame(paint); else painting=false;
    }
    var painting=false;
    function kick(){ pick(); if(!painting){ painting=true; requestAnimationFrame(paint); } }
    onScroll(kick); addEventListener('aura:tone',kick); kick();
  })();

  /* ── reveals, once, with a sweep so nothing can stay hidden ── */
  var rv=[].slice.call(document.querySelectorAll('.reveal,.plate,.gitem'));
  function show(e){ e.classList.add('in'); }
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ show(e.target); io.unobserve(e.target); } });
    },{threshold:0,rootMargin:'0px 0px -7% 0px'});
    rv.forEach(function(e){ io.observe(e); });
    var sweep=function(){ for(var i=0;i<rv.length;i++){ var e=rv[i]; if(!e.classList.contains('in') && e.getBoundingClientRect().top<innerHeight*0.97) show(e); } };
    onScroll(sweep); setTimeout(sweep,1200); addEventListener('load',sweep);
  } else rv.forEach(show);

  /* ── headline lines rise into place ── */
  (function(){
    var lines=[].slice.call(document.querySelectorAll('.ln>span'));
    if(!lines.length || reduce) return;
    lines.forEach(function(s,i){ s.style.transform='translateY(108%)'; s.style.transition='transform 1.1s cubic-bezier(.22,1,.36,1) '+(0.1+i*0.09)+'s'; });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ lines.forEach(function(s){ s.style.transform='none'; }); }); });
  })();

  /* ── the photo deck ── */
  (function(){
    var deck=document.getElementById('deck'); if(!deck) return;
    var cards=[].slice.call(deck.querySelectorAll('.card')),n=cards.length; if(!n) return;
    var hero=document.getElementById('top'),num=document.getElementById('deckNum'),cap=document.getElementById('deckCap'),fill=document.getElementById('deckFill');
    var cur=0,prev=-1,timer=null,visible=true,hovered=false,DUR=4200;
    function pad(x){ return (x<10?'0':'')+x; }
    function lay(){
      for(var i=0;i<n;i++){
        var c=cards[i],k=(i-cur+n)%n,t,o,f,z=n-k;
        if(i===prev&&prev!==cur){ t='translate3d(-38%,6%,0) rotate(-13deg) scale(.95)'; o=0; f='brightness(1)'; z=n+1; }
        else if(k===0){ t='translate3d(0,0,0) rotate(0deg) scale(1)'; o=1; f='brightness(1)'; }
        else if(k===1){ t='translate3d(6%,-3%,0) rotate(5deg) scale(.92)'; o=.95; f='brightness(.6)'; }
        else if(k===2){ t='translate3d(-6%,-5%,0) rotate(-6deg) scale(.85)'; o=.75; f='brightness(.42)'; }
        else { t='translate3d(0,-7%,0) rotate(0deg) scale(.78)'; o=0; f='brightness(.4)'; }
        c.style.transform=t; c.style.opacity=o; c.style.filter=f; c.style.zIndex=z;
        c.setAttribute('aria-hidden',k===0?'false':'true');
      }
      var a=cards[cur];
      if(num) num.textContent=pad(cur+1)+' / '+pad(n);
      if(cap) cap.textContent=a.dataset.cap||'';
      if(hero){ hero.dataset.c=a.dataset.c; dispatchEvent(new Event('aura:tone')); }
      if(fill){
        fill.style.transition='none'; fill.style.width='0%';
        if(!reduce&&running()){ void fill.offsetWidth; fill.style.transition='width '+DUR+'ms linear'; fill.style.width='100%'; }
      }
    }
    function running(){ return !reduce&&visible&&!hovered&&!document.hidden; }
    function schedule(){ clearTimeout(timer); if(running()) timer=setTimeout(function(){ go(1); },DUR); }
    function go(d){ prev=cur; cur=(cur+d+n)%n; lay(); schedule(); }
    lay(); schedule();

    var nx=document.getElementById('deckNext'),pv=document.getElementById('deckPrev');
    if(nx) nx.addEventListener('click',function(){ go(1); });
    if(pv) pv.addEventListener('click',function(){ go(-1); });
    deck.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){ e.preventDefault(); go(1); }
      else if(e.key==='ArrowLeft'){ e.preventDefault(); go(-1); }
    });
    /* swipe sideways on touch, tap or click to deal the next photograph */
    var sx=0,sy=0,down=false;
    deck.addEventListener('pointerdown',function(e){ down=true; sx=e.clientX; sy=e.clientY; });
    deck.addEventListener('pointerup',function(e){
      if(!down) return; down=false;
      var dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)) go(dx<0?1:-1);
      else if(Math.abs(dx)<8&&Math.abs(dy)<8) go(1);
    });
    deck.addEventListener('pointercancel',function(){ down=false; });
    deck.addEventListener('mouseenter',function(){ hovered=true; schedule(); lay(); });
    deck.addEventListener('mouseleave',function(){ hovered=false; schedule(); lay(); });
    document.addEventListener('visibilitychange',function(){ schedule(); });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible=es[0].isIntersecting; schedule(); },{threshold:0.2}).observe(deck);
    }
  })();

  /* ── manifesto: words brighten as you read down ── */
  document.querySelectorAll('.mani-text').forEach(function(p){
    if(reduce) return;
    var ws=[].slice.call(p.querySelectorAll('.w')); if(!ws.length) return;
    p.classList.add('mani-live');
    onScroll(function(){
      var r=p.getBoundingClientRect(),vh=innerHeight;
      var prog=(vh*0.82-r.top)/(r.height+vh*0.28);
      var lit=Math.round(Math.max(0,Math.min(1,prog))*ws.length);
      for(var i=0;i<ws.length;i++) ws[i].classList.toggle('on',i<lit);
    });
    request();
  });

  /* ── Calendly, loaded only when a visitor chooses to book ── */
  var CAL=window.AURA_CALENDLY;
  if(CAL&&/^https:\/\/calendly\.com\//.test(CAL)){
    var calState=0,calPromise=null;
    var loadCalendly=function(){
      if(calState===2) return Promise.resolve(true);
      if(calPromise) return calPromise;
      calState=1;
      calPromise=new Promise(function(res){
        var l=document.createElement('link');l.rel='stylesheet';l.href='https://assets.calendly.com/assets/external/widget.css';document.head.appendChild(l);
        var s=document.createElement('script');s.src='https://assets.calendly.com/assets/external/widget.js';s.async=true;
        s.onload=function(){calState=2;res(!!window.Calendly);};
        s.onerror=function(){calState=0;calPromise=null;res(false);};
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

  /* ── nav ── */
  var nav=document.getElementById('nav');
  if(nav){ onScroll(function(){ nav.classList.toggle('scrolled',scrollY>30); }); request(); }
  var burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
  if(burger&&drawer){
    var setDrawer=function(open){
      drawer.classList.toggle('open',open); document.body.classList.toggle('drawer-open',open);
      burger.setAttribute('aria-expanded',open?'true':'false'); burger.setAttribute('aria-label',open?'Close menu':'Open menu');
      root.style.overflow=open?'hidden':''; if(lenis){ open?lenis.stop():lenis.start(); }
    };
    burger.addEventListener('click',function(){ setDrawer(!drawer.classList.contains('open')); });
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setDrawer(false); }); });
    addEventListener('keydown',function(e){ if(e.key==='Escape'&&drawer.classList.contains('open')){ setDrawer(false); burger.focus(); } });
  }

  /* ── section jumper highlights where you are ── */
  (function(){
    var links=[].slice.call(document.querySelectorAll('.jump a')); if(!links.length) return;
    var secs=links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    onScroll(function(){
      var idx=-1;
      for(var i=0;i<secs.length;i++){ if(secs[i]&&secs[i].getBoundingClientRect().top<innerHeight*0.4) idx=i; }
      links.forEach(function(a,i){ a.classList.toggle('on',i===idx); });
    });
    request();
  })();

  /* ── FAQ ── */
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var it=q.closest('.faq-item'),a=it.querySelector('.faq-a'),open=it.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight=null; o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){ it.classList.add('open'); a.style.maxHeight=a.scrollHeight+'px'; q.setAttribute('aria-expanded','true'); }
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
  var top=document.getElementById('toTop');
  if(top){
    onScroll(function(){ top.classList.toggle('show',scrollY>900); });
    top.addEventListener('click',function(){ if(lenis) lenis.scrollTo(0); else scrollTo({top:0,behavior:reduce?'auto':'smooth'}); });
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

  request();
})();
