/* ═══════════ AURA FILMS - SHARED JS (validated) ═══════════ */
(function(){
  "use strict";

  /* deter casual image saving: block right-click + drag on photos */
  document.addEventListener('contextmenu',function(e){
    if(e.target.closest('picture,img,.gitem,.ccard,.tcard-img,.founder-img,.philo-media,.lb')) e.preventDefault();
  });
  document.addEventListener('dragstart',function(e){ if(e.target.tagName==='IMG') e.preventDefault(); });

  /* Calendly popup on "Book a Date" buttons — only when a real link is set */
  var CAL=window.AURA_CALENDLY;
  if(CAL&&/^https:\/\/calendly\.com\//.test(CAL)){
    document.querySelectorAll('.nav-cta').forEach(function(b){
      b.addEventListener('click',function(e){ if(window.Calendly){ e.preventDefault(); window.Calendly.initPopupWidget({url:CAL}); } });
    });
  }

  var nav=document.getElementById('nav');
  if(nav)addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>40);},{passive:true});

  var burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
  if(burger&&drawer){
    burger.addEventListener('click',function(){drawer.classList.toggle('open');});
    drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){drawer.classList.remove('open');});});
  }

  /* CTA word cycle (~1.2s) */
  var word=document.querySelector('.word');
  if(word){
    var ws=[].slice.call(word.querySelectorAll('.w')),i=0;
    setInterval(function(){ws[i].classList.remove('on');i=(i+1)%ws.length;ws[i].classList.add('on');},1300);
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var it=q.closest('.faq-item'),a=it.querySelector('.faq-a'),open=it.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;});
      if(!open){it.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });

  /* package tabs (CSS crossfades) */
  document.querySelectorAll('.pk-tab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.pk-tab').forEach(function(x){x.classList.remove('on');});
      t.classList.add('on');
      document.querySelectorAll('.pk-panel').forEach(function(pp){pp.classList.toggle('on',pp.dataset.panel===t.dataset.tab);});
    });
  });

  /* gallery filter + deep-link from hash */
  var filters=[].slice.call(document.querySelectorAll('.filter'));
  function applyFilter(c){
    filters.forEach(function(x){x.classList.toggle('on',x.dataset.cat===c);});
    document.querySelectorAll('.gitem').forEach(function(g){g.classList.toggle('hide',c!=='all'&&g.dataset.cat!==c);});
  }
  if(filters.length){
    var CATS=['weddings','portraits','family','architecture'];
    filters.forEach(function(f){f.addEventListener('click',function(){applyFilter(f.dataset.cat);});});
    function fromHash(scroll){
      var h=(location.hash||'').replace('#','');
      if(CATS.indexOf(h)>-1){applyFilter(h);if(scroll){var g=document.querySelector('.filters');if(g)g.scrollIntoView({behavior:'smooth',block:'start'});}}
    }
    fromHash(false);                                   // initial deep-link
    addEventListener('hashchange',function(){fromHash(true);});  // same-page footer/card clicks
  }

  /* smooth lightbox */
  var items=[].slice.call(document.querySelectorAll('[data-full]'));
  var lb=document.getElementById('lb');
  if(lb&&items.length){
    var lbImg=document.getElementById('lbImg'),idx=0,pool=items;
    function visible(){return items.filter(function(t){return !t.classList.contains('hide');});}
    function load(src,alt){
      lbImg.classList.remove('show');var pre=new Image();pre.src=src;
      var go=function(){lbImg.src=src;lbImg.alt=alt||'';requestAnimationFrame(function(){lbImg.classList.add('show');});};
      if(pre.decode){pre.decode().then(go).catch(go);}else{pre.onload=go;pre.onerror=go;}
    }
    function show(){var t=pool[idx];load(t.dataset.full,(t.querySelector('img')||{}).alt);}
    function open(t){pool=visible();idx=pool.indexOf(t);lb.classList.add('open');document.body.style.overflow='hidden';show();}
    function close(){lb.classList.remove('open');lbImg.classList.remove('show');document.body.style.overflow='';}
    function prev(){idx=(idx-1+pool.length)%pool.length;show();}
    function next(){idx=(idx+1)%pool.length;show();}
    items.forEach(function(t){t.addEventListener('click',function(){open(t);});});
    document.getElementById('lbClose').addEventListener('click',close);
    document.getElementById('lbPrev').addEventListener('click',prev);
    document.getElementById('lbNext').addEventListener('click',next);
    lb.addEventListener('click',function(e){if(e.target===lb)close();});
    addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')close();else if(e.key==='ArrowLeft')prev();else if(e.key==='ArrowRight')next();});
  }

  /* scroll-to-top */
  var top=document.getElementById('toTop');
  if(top){addEventListener('scroll',function(){top.classList.toggle('show',scrollY>520);},{passive:true});
    top.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});}

  /* ── testimonials carousel (autoplay 6.5s + arrows + dots) ── */
  var tcar=document.getElementById('tcar');
  if(tcar){
    var slides=[].slice.call(tcar.querySelectorAll('.tslide')),dots=[].slice.call(tcar.querySelectorAll('.tdot')),track=document.getElementById('tslideTrack'),ti=0,timer;
    function go(n){ti=(n+slides.length)%slides.length;
      if(track)track.style.transform='translateX(-'+(ti*100)+'%)';
      slides.forEach(function(s,k){s.classList.toggle('on',k===ti);});
      dots.forEach(function(d,k){d.classList.toggle('on',k===ti);});}
    function play(){clearInterval(timer);timer=setInterval(function(){go(ti+1);},6500);}
    var pv=tcar.querySelector('.tprev'),nx=tcar.querySelector('.tnext');
    if(pv)pv.addEventListener('click',function(){go(ti-1);play();});
    if(nx)nx.addEventListener('click',function(){go(ti+1);play();});
    dots.forEach(function(d){d.addEventListener('click',function(){go(+d.dataset.i);play();});});
    play();
  }

  /* ── contact form: Web3Forms AJAX + on-page thank-you ── */
  var cf=document.getElementById('cform');
  if(cf){
    cf.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=document.getElementById('cf-btn');btn.classList.add('loading');btn.textContent='Sending…';
      var data=new FormData(cf);
      fetch('https://api.web3forms.com/submit',{method:'POST',body:data,headers:{Accept:'application/json'}})
        .then(function(r){return r.json();})
        .then(function(j){
          if(j.success){cf.classList.add('sent');document.getElementById('cformThanks').classList.add('show');}
          else{btn.classList.remove('loading');btn.textContent='Try again';}
        })
        .catch(function(){btn.classList.remove('loading');btn.textContent='Try again, or email us';});
    });
  }

  /* ── interactive hero: hover Aura / Films to reveal photo clusters ── */
  var ihw=document.querySelector('.ihero-word');
  if(ihw){
    var hws=[].slice.call(ihw.querySelectorAll('.hw'));
    var cl={aura:document.querySelector('.c-aura'),films:document.querySelector('.c-films')};
    function iact(set){ihw.classList.add('hovering');hws.forEach(function(w){w.classList.toggle('active',w.dataset.set===set);});for(var k in cl){if(cl[k])cl[k].classList.toggle('show',k===set);}}
    function ideact(){ihw.classList.remove('hovering');hws.forEach(function(w){w.classList.remove('active');});for(var k in cl){if(cl[k])cl[k].classList.remove('show');}}
    hws.forEach(function(w){w.addEventListener('mouseenter',function(){iact(w.dataset.set);});});
    ihw.addEventListener('mouseleave',ideact);
    if(matchMedia('(hover:none)').matches){var iss=['aura','films'],ici=0;iact('aura');setInterval(function(){ici=(ici+1)%2;iact(iss[ici]);},2800);}
  }

  /* ── drag-to-explore: INFINITE pannable canvas (pointer+touch, buttery inertia, cursor parallax, tap to enlarge) ── */
  var stage=document.getElementById('dragStage');
  if(stage){
    var board=document.getElementById('dragBoard'),pill=document.getElementById('dragPill');
    var dlb=document.getElementById('dragLb'),dlbImg=document.getElementById('dragLbImg'),dlbClose=document.getElementById('dragLbClose');
    var CW=+stage.dataset.cw||1760,CH=+stage.dataset.ch||2080;
    var px=-CW,py=-CH,vx=0,vy=0,parX=0,parY=0,ptX=0,ptY=0,drag=false,lx=0,ly=0,downX=0,downY=0;
    function apply(){var wx=((px%CW)+CW)%CW,wy=((py%CH)+CH)%CH;board.style.transform='translate3d('+(wx-CW+parX)+'px,'+(wy-CH+parY)+'px,0)';}
    function tick(){
      if(!drag){px+=vx;py+=vy;vx*=0.95;vy*=0.95;if(Math.abs(vx)<0.03)vx=0;if(Math.abs(vy)<0.03)vy=0;}
      parX+=(ptX-parX)*0.05;parY+=(ptY-parY)*0.05;apply();requestAnimationFrame(tick);}
    stage.addEventListener('pointerdown',function(e){drag=true;vx=vy=0;stage.classList.add('grabbing');lx=downX=e.clientX;ly=downY=e.clientY;try{stage.setPointerCapture(e.pointerId);}catch(_){}});
    stage.addEventListener('pointermove',function(e){
      var r=stage.getBoundingClientRect();pill.style.left=(e.clientX-r.left)+'px';pill.style.top=(e.clientY-r.top)+'px';pill.style.opacity='1';
      ptX=(r.width/2-(e.clientX-r.left))*0.05;ptY=(r.height/2-(e.clientY-r.top))*0.05;
      if(!drag)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
      vx=Math.max(-46,Math.min(46,dx));vy=Math.max(-46,Math.min(46,dy));px+=dx;py+=dy;});
    function openFull(fig){dlbImg.src=fig.getAttribute('data-full');dlb.classList.add('open');dlb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
    function endDrag(e){if(!drag)return;drag=false;stage.classList.remove('grabbing');
      /* a genuine tap (barely moved) enlarges the photo under the pointer */
      if(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)<7){var el=document.elementFromPoint(e.clientX,e.clientY);var fig=el&&el.closest?el.closest('.drag-pic'):null;if(fig){vx=vy=0;openFull(fig);}}}
    stage.addEventListener('pointerup',endDrag);
    stage.addEventListener('pointercancel',function(){drag=false;stage.classList.remove('grabbing');});
    stage.addEventListener('pointerleave',function(){pill.style.opacity='0';ptX=ptY=0;});
    function closeDlb(){dlb.classList.remove('open');dlb.setAttribute('aria-hidden','true');document.body.style.overflow='';dlbImg.src='';}
    dlbClose.addEventListener('click',closeDlb);
    dlb.addEventListener('click',closeDlb);                     // click backdrop OR the photo → back
    addEventListener('keydown',function(e){if(e.key==='Escape'&&dlb.classList.contains('open'))closeDlb();});
    requestAnimationFrame(tick);
  }
})();
