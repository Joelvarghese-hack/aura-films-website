/* ═══════════ AURA FILMS — SHARED JS (validated) ═══════════ */
(function(){
  "use strict";
  // nav scroll state
  var nav=document.getElementById('nav');
  if(nav)addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>40);},{passive:true});

  // mobile drawer
  var burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
  if(burger&&drawer){
    burger.addEventListener('click',function(){drawer.classList.toggle('open');});
    drawer.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){drawer.classList.remove('open');});});
  }

  // counters
  if('IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        var el=e.target,t=+el.dataset.count,n=0,step=t/45;
        var tick=function(){n+=step;if(n<t){el.textContent=Math.floor(n);requestAnimationFrame(tick);}else{el.textContent=t;}};
        tick();cio.unobserve(el);
      });
    },{threshold:.5});
    document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el);});
  }

  // CTA word cycle
  var word=document.querySelector('.word');
  if(word){
    var ws=[].slice.call(word.querySelectorAll('.w')),i=0;
    setInterval(function(){ws[i].classList.remove('on');i=(i+1)%ws.length;ws[i].classList.add('on');},3600);
  }

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var it=q.closest('.faq-item'),a=it.querySelector('.faq-a'),open=it.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;});
      if(!open){it.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });

  // package tabs
  document.querySelectorAll('.pk-tab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.pk-tab').forEach(function(x){x.classList.remove('on');});
      t.classList.add('on');
      document.querySelectorAll('.pk-panel').forEach(function(pp){pp.classList.toggle('on',pp.dataset.panel===t.dataset.tab);});
    });
  });

  // gallery filter
  var filters=document.querySelectorAll('.filter');
  if(filters.length){
    filters.forEach(function(f){
      f.addEventListener('click',function(){
        filters.forEach(function(x){x.classList.remove('on');});
        f.classList.add('on');
        var c=f.dataset.cat;
        document.querySelectorAll('.gitem').forEach(function(g){
          g.classList.toggle('hide',c!=='all'&&g.dataset.cat!==c);
        });
      });
    });
  }

  // ── smooth lightbox (preload + fade) ──
  var items=[].slice.call(document.querySelectorAll('[data-full]'));
  var lb=document.getElementById('lb');
  if(lb&&items.length){
    var lbImg=document.getElementById('lbImg'),idx=0,pool=items;
    function visible(){return items.filter(function(t){return !t.classList.contains('hide');});}
    function load(src,alt){
      lbImg.classList.remove('show');
      var pre=new Image();
      pre.src=src;
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
    addEventListener('keydown',function(e){
      if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')close();else if(e.key==='ArrowLeft')prev();else if(e.key==='ArrowRight')next();
    });
  }

  // ── scroll-to-top ──
  var top=document.getElementById('toTop');
  if(top){
    addEventListener('scroll',function(){top.classList.toggle('show',scrollY>520);},{passive:true});
    top.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});
  }
})();
