/* ═══════════ AURA FILMS — SHARED JS (validated) ═══════════ */
(function(){
  "use strict";
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
    filters.forEach(function(f){f.addEventListener('click',function(){applyFilter(f.dataset.cat);});});
    var h=(location.hash||'').replace('#','');
    if(h&&['weddings','engagements','portraits','family'].indexOf(h)>-1)applyFilter(h);
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
    var slides=[].slice.call(tcar.querySelectorAll('.tslide')),dots=[].slice.call(tcar.querySelectorAll('.tdot')),ti=0,timer;
    function go(n){ti=(n+slides.length)%slides.length;
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
        .catch(function(){btn.classList.remove('loading');btn.textContent='Try again — or email us';});
    });
  }
})();
