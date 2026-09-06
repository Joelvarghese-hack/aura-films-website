/* ═══════════════════════════════════════════════════════════════
   AURA FILMS — MOTION LAYER  (dependency-free · CSP-clean)
   Adds cinematic variety + smooth scroll on TOP of the existing
   .reveal system, without editing page markup. Safe, guarded,
   and fully reversible (remove the css link + this script).
   Toggle at runtime:  window.AuraMotion.smooth(false)
   ═══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fine   = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var hasIO  = 'IntersectionObserver' in window;

  /* ─────────────────────────────────────────────────────────────
     1) REVEAL VARIETY
     Give each existing .reveal a character based on what it is, so
     the page stops doing the identical fade-up on every block.
     The inline observer already adds `.in`; we just add a variant
     class. If `.in` is already present, the CSS end-state applies —
     no flash, no double animation. Images get the mask treatment
     via their own wrappers below (kept separate to avoid transform
     clashes with the sliding rows). ──────────────────────────── */
  function assignVariants(){
    var reveals = document.querySelectorAll('.reveal');
    for(var i=0;i<reveals.length;i++){
      var el = reveals[i];
      if(el.dataset.am) continue;
      var v;
      if(el.matches('.sec-title,.sec-head,h1,h2,.eyebrow'))        v='rise';
      else if(el.matches('.cat-row'))  v = el.classList.contains('alt') ? 'right':'left';
      else if(el.matches('.step,.tslide-card,.pk-panel,.foot-col,.tcard,figure,.card')) v='scale';
      else v='rise';                       /* elegant default > plain fade-up */
      el.dataset.am = v;
      el.classList.add('am-'+v);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     2) CINEMATIC IMAGE MASK REVEAL
     The signature photography move — the frame wipes open while the
     photo eases down from a slight zoom. Applied to image WRAPPERS.
     Driven by our OWN observer so it never depends on an element
     also being a `.reveal`. Multiple safety nets guarantee an image
     can never stay hidden. ──────────────────────────────────── */
  var maskSel = '.cat-row-img,.tslide-img,.founder-img,.philo-media,.tcard-img,.gitem';
  var masks = [];
  function collectMasks(){
    var list = document.querySelectorAll(maskSel);
    for(var i=0;i<list.length;i++){
      var el = list[i];
      if(el.dataset.amMask) continue;
      /* must actually contain a direct image, else skip (don't clip text) */
      if(!el.querySelector(':scope > picture, :scope > img, :scope > .lb')) continue;
      el.dataset.amMask = '1';
      el.classList.add('am-mask');
      masks.push(el);
    }
  }
  function openMask(el){ el.classList.add('in'); }

  /* ── observers ── */
  function inView(el, margin){
    var r = el.getBoundingClientRect();
    return r.top < innerHeight*(margin||0.92) && r.bottom > 0;
  }
  function startMaskObserver(){
    if(reduce){ masks.forEach(openMask); return; }      /* css already shows them, but be explicit */
    if(!hasIO){ masks.forEach(openMask); return; }
    var mo = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ openMask(e.target); mo.unobserve(e.target); } });
    },{threshold:0, rootMargin:'0px 0px 12% 0px'});   /* open just BEFORE it enters view */
    masks.forEach(function(el){ if(inView(el,1.12)) openMask(el); else mo.observe(el); });
    /* SAFETY NET 1: passive scroll/resize sweep — guarantees reveal even
       if IntersectionObserver ever fails to fire. Self-removes when done. */
    function sweep(){
      var pending=0;
      for(var i=0;i<masks.length;i++){ var el=masks[i];
        if(el.classList.contains('in')) continue;
        if(inView(el,0.98)) openMask(el); else pending++;
      }
      if(pending===0){ removeEventListener('scroll',sweep); removeEventListener('resize',sweep); }
    }
    addEventListener('scroll', sweep, {passive:true});
    addEventListener('resize', sweep, {passive:true});
    /* SAFETY NET 2: a beat after full load, open anything already in view */
    addEventListener('load', function(){ setTimeout(sweep, 400); });
  }

  /* ─────────────────────────────────────────────────────────────
     3) SMOOTH SCROLL (Lenis-lite)
     Weighted, cinematic wheel scrolling on desktop pointers only.
     It keeps the REAL scroll position (no wrapper transform), so
     the fixed nav, lightboxes, drag-canvas math and scroll-to-top
     all keep working. Native scroll stays on touch (phones already
     have great momentum) and whenever a modal locks the body. ─── */
  var Smooth = (function(){
    var target=0, current=0, running=false, enabled=false, raf=0;
    function max(){ return Math.max(0, document.documentElement.scrollHeight - innerHeight); }
    function locked(){
      /* a modal set body overflow hidden (lightbox / drag viewer / drawer) */
      return document.body.style.overflow === 'hidden';
    }
    function loop(){
      current += (target - current) * 0.11;
      if(Math.abs(target - current) < 0.5){ current = target; running=false; window.scrollTo(0,current); return; }
      window.scrollTo(0, current);
      raf = requestAnimationFrame(loop);
    }
    function onWheel(e){
      if(!enabled || locked()) return;
      /* let regions opt out of hijacking (drag canvas, open viewers) */
      if(e.target.closest && e.target.closest('#dragStage,[data-am-native],.lb.open,.drag-lb.open,#dragLb.open')) return;
      if(e.ctrlKey) return;                       /* pinch-zoom */
      e.preventDefault();
      var d = e.deltaY * (e.deltaMode===1 ? 32 : e.deltaMode===2 ? innerHeight : 1);
      target = Math.min(max(), Math.max(0, target + d));
      if(!running){ running=true; raf=requestAnimationFrame(loop); }
    }
    function resync(){ if(!running){ target = current = window.scrollY; } }
    function on(){
      if(enabled || !fine || reduce) return;
      enabled=true; target=current=window.scrollY;
      addEventListener('wheel', onWheel, {passive:false});
      addEventListener('scroll', resync, {passive:true});   /* keyboard / anchor / scrollbar */
    }
    function off(){
      enabled=false; running=false; cancelAnimationFrame(raf);
      removeEventListener('wheel', onWheel, {passive:false});
      removeEventListener('scroll', resync, {passive:true});
    }
    return {on:on, off:off};
  })();

  /* ─────────────────────────────────────────────────────────────
     4) MAGNETIC CONTROLS + NAV UNDERLINE SWEEP  (desktop only) ── */
  function tactile(){
    document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.add('am-link'); });
    if(!fine || reduce) return;
    var STR = 0.32, CAP = 8;
    document.querySelectorAll('.nav-cta,.btn').forEach(function(b){
      b.classList.add('am-magnetic');
      b.addEventListener('pointermove', function(e){
        var r = b.getBoundingClientRect();
        var mx = Math.max(-CAP, Math.min(CAP, (e.clientX - (r.left+r.width/2))*STR));
        var my = Math.max(-CAP, Math.min(CAP, (e.clientY - (r.top +r.height/2))*STR));
        b.classList.add('am-grabbing');
        b.style.setProperty('--am-mx', mx.toFixed(1)+'px');
        b.style.setProperty('--am-my', my.toFixed(1)+'px');
      });
      b.addEventListener('pointerleave', function(){
        b.classList.remove('am-grabbing');
        b.style.setProperty('--am-mx','0px');
        b.style.setProperty('--am-my','0px');
      });
    });
  }

  /* ── boot ── */
  function init(){
    assignVariants();
    collectMasks();
    startMaskObserver();
    tactile();
    /* NOTE: custom wheel smooth-scroll is OFF by default — it felt sluggish
       and could block reveals. Native scrolling is snappier. Opt in anytime
       with AuraMotion.smooth(true) if you want to test the weighted feel. */
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* public toggle for easy tuning / disabling */
  window.AuraMotion = { smooth:function(v){ v===false ? Smooth.off() : Smooth.on(); } };
})();
