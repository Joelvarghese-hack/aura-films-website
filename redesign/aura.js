/* ═══════════ AURA FILMS — ATLAS BEHAVIOUR ═══════════ */
(function(){
  "use strict";
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = matchMedia('(min-width:1024px)').matches && matchMedia('(hover:hover)').matches;

  /* deter casual image saving */
  document.addEventListener('contextmenu',function(e){
    if(e.target.closest('picture,img,.gitem,.ccard,.tslide-img,.founder-solo-img,.cat-row-img,.lb,.drag-lb')) e.preventDefault();
  });
  document.addEventListener('dragstart',function(e){ if(e.target.tagName==='IMG') e.preventDefault(); });

  /* ── weighted smooth scroll, only if the library is present ── */
  var lenis=null;
  if(window.Lenis && !reduce){
    document.documentElement.classList.add('has-lenis');
    lenis=new window.Lenis({duration:1.05,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));},smoothWheel:true,syncTouch:false});
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function goTo(el){ if(lenis) lenis.scrollTo(el); else el.scrollIntoView({behavior:'smooth',block:'start'}); }

  /* ── the journey: background lerps between chapter colour worlds ── */
  (function(){
    var worlds=[].slice.call(document.querySelectorAll('[data-c]')).map(function(el){
      return {el:el,c:el.dataset.c.split(',').map(Number)};
    });
    if(!worlds.length || reduce) return;
    var cur=[20,16,14],want=[20,16,14],first=true;
    function pick(){
      var mid=innerHeight*0.45,best=null;
      for(var i=0;i<worlds.length;i++){
        var r=worlds[i].el.getBoundingClientRect();
        if(r.height===0) continue;            /* hidden sections must not hijack the colour */
        if(r.top<=mid && r.bottom>=0) best=worlds[i];
      }
      want=best?best.c:[20,16,14];
    }
    function paint(){
      var moved=false;
      for(var i=0;i<3;i++){ var d=want[i]-cur[i]; if(Math.abs(d)>0.4){cur[i]+=d*0.07;moved=true;} else cur[i]=want[i]; }
      if(moved||first){ first=false;
        document.body.style.setProperty('--bgc',Math.round(cur[0])+','+Math.round(cur[1])+','+Math.round(cur[2])); }
      requestAnimationFrame(paint);
    }
    pick(); cur=want.slice(); paint();
    addEventListener('scroll',pick,{passive:true}); addEventListener('resize',pick);
  })();

  /* ── reveals (once), with a sweep so nothing can stay hidden ── */
  var rv=[].slice.call(document.querySelectorAll('.reveal,.plate,.gitem'));
  function lightUp(e){ e.classList.add('in'); }
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ lightUp(e.target); io.unobserve(e.target); } });
    },{threshold:0,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(e){ io.observe(e); });
    function sweep(){ rv.forEach(function(e){ if(!e.classList.contains('in')){ var r=e.getBoundingClientRect();
      if(r.top<innerHeight*0.96) lightUp(e); } }); }
    setTimeout(sweep,1500); addEventListener('load',sweep); addEventListener('scroll',sweep,{passive:true});
  } else rv.forEach(lightUp);

  /* ── hero lines rise on load ── */
  (function(){
    var l=[].slice.call(document.querySelectorAll('.hero .rise>span'));
    if(!l.length) return;
    if(reduce){ l.forEach(function(s){s.style.transform='none';}); return; }
    l.forEach(function(s,i){
      s.style.transform='translateY(110%)';
      s.style.transition='transform 1.05s cubic-bezier(.22,1,.36,1) '+(0.12+i*0.08)+'s';
    });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      l.forEach(function(s){ s.style.transform='none'; }); }); });
  })();

  /* ── Calendly, loaded only when a visitor chooses to book ── */
  var CAL=window.AURA_CALENDLY;
  if(CAL&&/^https:\/\/calendly\.com\//.test(CAL)){
    var calState=0,calPromise=null;
    function loadCalendly(){
      if(calState===2) return Promise.resolve(true);
      if(calPromise) return calPromise;
      calState=1;
      calPromise=new Promise(function(res){
        var l=document.createElement('link');l.rel='stylesheet';l.href='https://assets.calendly.com/assets/external/widget.css';document.head.appendChild(l);
        var s=document.createElement('script');s.src='https://assets.calendly.com/assets/external/widget.js';s.async=true;
        s.onload=function(){calState=2;res(!!window.Calendly);};
        s.onerror=function(){calState=0;res(false);};
        document.head.appendChild(s);
      });
      return calPromise;
    }
    document.querySelectorAll('.nav-cta').forEach(function(b){
      b.addEventListener('click',function(e){
        e.preventDefault();
        loadCalendly().then(function(ok){
          if(ok&&window.Calendly) window.Calendly.initPopupWidget({url:CAL});
          else location.href=b.getAttribute('href')||'about.html#contact';
        });
      });
    });
    document.querySelectorAll('[data-cal-embed]').forEach(function(box){
      var btn=box.querySelector('.cal-load'); if(!btn) return;
      btn.addEventListener('click',function(){
        btn.disabled=true;btn.textContent='Loading calendar…';
        var url=box.getAttribute('data-cal-embed');
        loadCalendly().then(function(ok){
          if(ok&&window.Calendly){
            box.innerHTML='<div class="calendly-inline-widget" style="min-width:320px;height:660px"></div>';
            window.Calendly.initInlineWidget({url:url,parentElement:box.firstChild});
          } else { btn.disabled=false;btn.textContent='Calendar unavailable, email us instead'; }
        });
      });
    });
  }

  /* ── nav ── */
  var nav=document.getElementById('nav');
  if(nav) addEventListener('scroll',function(){ nav.classList.toggle('scrolled',scrollY>40); },{passive:true});

  var burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
  if(burger&&drawer){
    function setDrawer(open){
      drawer.classList.toggle('open',open);
      document.body.classList.toggle('drawer-open',open);
      burger.setAttribute('aria-expanded',open?'true':'false');
      document.documentElement.style.overflow=open?'hidden':'';
    }
    burger.addEventListener('click',function(){ setDrawer(!drawer.classList.contains('open')); });
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setDrawer(false); }); });
    addEventListener('keydown',function(e){ if(e.key==='Escape'&&drawer.classList.contains('open')) setDrawer(false); });
  }

  /* ── closing call to action: rotating word ── */
  var word=document.querySelector('.word');
  if(word){
    var ws=[].slice.call(word.querySelectorAll('.w')),wi=0;
    if(ws.length>1) setInterval(function(){
      ws[wi].classList.remove('on'); wi=(wi+1)%ws.length; ws[wi].classList.add('on');
    },2400);
  }

  /* ── FAQ ── */
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.setAttribute('aria-expanded','false');
    q.addEventListener('click',function(){
      var it=q.closest('.faq-item'),a=it.querySelector('.faq-a'),open=it.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight=null;
        o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){ it.classList.add('open'); a.style.maxHeight=a.scrollHeight+'px'; q.setAttribute('aria-expanded','true'); }
    });
  });

  /* ── package tabs ── */
  document.querySelectorAll('.pk-tab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.pk-tab').forEach(function(x){ x.classList.remove('on'); x.setAttribute('aria-selected','false'); });
      t.classList.add('on'); t.setAttribute('aria-selected','true');
      document.querySelectorAll('.pk-panel').forEach(function(p){ p.classList.toggle('on',p.dataset.panel===t.dataset.tab); });
    });
  });

  /* ── gallery filter + hash deep link ── */
  var filters=[].slice.call(document.querySelectorAll('.filter'));
  if(filters.length){
    var CATS=['weddings','portraits','family','architecture'];
    function applyFilter(c){
      filters.forEach(function(x){ x.classList.toggle('on',x.dataset.cat===c); });
      document.querySelectorAll('.gitem').forEach(function(g){
        g.classList.toggle('hide',c!=='all'&&g.dataset.cat!==c);
      });
    }
    filters.forEach(function(f){ f.addEventListener('click',function(){ applyFilter(f.dataset.cat); }); });
    function fromHash(scroll){
      var h=(location.hash||'').replace('#','');
      if(CATS.indexOf(h)>-1){ applyFilter(h);
        if(scroll){ var g=document.querySelector('.filters'); if(g) goTo(g); } }
    }
    fromHash(false);
    addEventListener('hashchange',function(){ fromHash(true); });
  }

  /* ── lightbox ── */
  var items=[].slice.call(document.querySelectorAll('.gitem[data-full]'));
  var lb=document.getElementById('lb');
  if(lb&&items.length){
    var lbImg=document.getElementById('lbImg'),idx=0,pool=items;
    function visible(){ return items.filter(function(t){ return !t.classList.contains('hide'); }); }
    function load(src,alt){
      lbImg.classList.remove('show');
      var pre=new Image(); pre.src=src;
      var go=function(){ lbImg.src=src; lbImg.alt=alt||''; requestAnimationFrame(function(){ lbImg.classList.add('show'); }); };
      if(pre.decode) pre.decode().then(go).catch(go); else { pre.onload=go; pre.onerror=go; }
    }
    function show(){ var t=pool[idx]; load(t.dataset.full,(t.querySelector('img')||{}).alt); }
    function open(t){ pool=visible(); idx=pool.indexOf(t); lb.classList.add('open'); document.documentElement.style.overflow='hidden'; show(); }
    function close(){ lb.classList.remove('open'); lbImg.classList.remove('show'); document.documentElement.style.overflow=''; }
    function prev(){ idx=(idx-1+pool.length)%pool.length; show(); }
    function next(){ idx=(idx+1)%pool.length; show(); }
    items.forEach(function(t){ t.addEventListener('click',function(){ open(t); }); });
    document.getElementById('lbClose').addEventListener('click',close);
    document.getElementById('lbPrev').addEventListener('click',prev);
    document.getElementById('lbNext').addEventListener('click',next);
    lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
    addEventListener('keydown',function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') close(); else if(e.key==='ArrowLeft') prev(); else if(e.key==='ArrowRight') next();
    });
  }

  /* ── back to top ── */
  var top=document.getElementById('toTop');
  if(top){
    addEventListener('scroll',function(){ top.classList.toggle('show',scrollY>600); },{passive:true});
    top.addEventListener('click',function(){ lenis?lenis.scrollTo(0):scrollTo({top:0,behavior:'smooth'}); });
  }

  /* ── testimonials ── */
  var tcar=document.getElementById('tcar');
  if(tcar){
    var slides=[].slice.call(tcar.querySelectorAll('.tslide')),
        dots=[].slice.call(tcar.querySelectorAll('.tdot')),
        track=document.getElementById('tslideTrack'),ti=0,timer;
    function go(n){
      ti=(n+slides.length)%slides.length;
      if(track) track.style.transform='translateX(-'+(ti*100)+'%)';
      slides.forEach(function(s,k){ s.classList.toggle('on',k===ti); });
      dots.forEach(function(d,k){ d.classList.toggle('on',k===ti); });
    }
    function play(){ clearInterval(timer); timer=setInterval(function(){ go(ti+1); },6500); }
    var pv=tcar.querySelector('.tprev'),nx=tcar.querySelector('.tnext');
    if(pv) pv.addEventListener('click',function(){ go(ti-1); play(); });
    if(nx) nx.addEventListener('click',function(){ go(ti+1); play(); });
    dots.forEach(function(d){ d.addEventListener('click',function(){ go(+d.dataset.i); play(); }); });
    play();
  }

  /* ── contact form ── */
  var cf=document.getElementById('cform');
  if(cf){
    cf.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=document.getElementById('cf-btn');
      btn.classList.add('loading'); btn.textContent='Sending…';
      fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(cf),headers:{Accept:'application/json'}})
        .then(function(r){ return r.json(); })
        .then(function(j){
          if(j.success){ cf.classList.add('sent'); document.getElementById('cformThanks').classList.add('show'); }
          else { btn.classList.remove('loading'); btn.textContent='Try again'; }
        })
        .catch(function(){ btn.classList.remove('loading'); btn.textContent='Try again, or email us'; });
    });
  }

  /* ── drag to explore: desktop pointers only, never a scroll trap on touch ── */
  var stage=document.getElementById('dragStage');
  if(stage && desktop && !reduce){
    var board=document.getElementById('dragBoard'),pill=document.getElementById('dragPill');
    var dlb=document.getElementById('dragLb'),dlbImg=document.getElementById('dragLbImg'),dlbClose=document.getElementById('dragLbClose');
    var CW=+stage.dataset.cw||1760,CH=+stage.dataset.ch||2600;
    var px=-CW,py=-CH,vx=0,vy=0,parX=0,parY=0,ptX=0,ptY=0,drag=false,lx=0,ly=0,downX=0,downY=0;
    function apply(){
      var wx=((px%CW)+CW)%CW, wy=((py%CH)+CH)%CH;
      board.style.transform='translate3d('+(wx-CW+parX)+'px,'+(wy-CH+parY)+'px,0)';
    }
    function tick(){
      if(!drag){ px+=vx; py+=vy; vx*=0.95; vy*=0.95;
        if(Math.abs(vx)<0.03) vx=0; if(Math.abs(vy)<0.03) vy=0; }
      parX+=(ptX-parX)*0.05; parY+=(ptY-parY)*0.05;
      apply(); requestAnimationFrame(tick);
    }
    stage.addEventListener('pointerdown',function(e){
      drag=true; vx=vy=0; stage.classList.add('grabbing');
      lx=downX=e.clientX; ly=downY=e.clientY;
      try{ stage.setPointerCapture(e.pointerId); }catch(_){}
    });
    stage.addEventListener('pointermove',function(e){
      var r=stage.getBoundingClientRect();
      pill.style.left=(e.clientX-r.left)+'px'; pill.style.top=(e.clientY-r.top)+'px'; pill.style.opacity='1';
      ptX=(r.width/2-(e.clientX-r.left))*0.05; ptY=(r.height/2-(e.clientY-r.top))*0.05;
      if(!drag) return;
      var dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
      vx=Math.max(-46,Math.min(46,dx)); vy=Math.max(-46,Math.min(46,dy));
      px+=dx; py+=dy;
    });
    function endDrag(e){
      if(!drag) return; drag=false; stage.classList.remove('grabbing');
      if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)<7){
        var el=document.elementFromPoint(e.clientX,e.clientY);
        var fig=el&&el.closest?el.closest('.drag-pic'):null;
        if(fig&&dlb){ vx=vy=0; dlbImg.src=fig.getAttribute('data-full');
          dlb.classList.add('open'); dlb.setAttribute('aria-hidden','false'); document.documentElement.style.overflow='hidden'; }
      }
    }
    stage.addEventListener('pointerup',endDrag);
    stage.addEventListener('pointercancel',function(){ drag=false; stage.classList.remove('grabbing'); });
    stage.addEventListener('pointerleave',function(){ pill.style.opacity='0'; ptX=ptY=0; });
    if(dlb){
      function closeDlb(){ dlb.classList.remove('open'); dlb.setAttribute('aria-hidden','true');
        document.documentElement.style.overflow=''; dlbImg.src=''; }
      dlbClose.addEventListener('click',closeDlb);
      dlb.addEventListener('click',closeDlb);
      addEventListener('keydown',function(e){ if(e.key==='Escape'&&dlb.classList.contains('open')) closeDlb(); });
    }
    requestAnimationFrame(tick);
  }

  /* ── in-page anchors follow the smooth scroller ── */
  if(lenis){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var id=a.getAttribute('href'); if(id.length<2) return;
        var el=document.querySelector(id); if(!el) return;
        e.preventDefault(); goTo(el);
      });
    });
  }
})();
