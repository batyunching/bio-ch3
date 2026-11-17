/* =========================================================
   單元頁共用：翻面概念卡、我懂了 ✓、單元進度
   概念卡 HTML：<div class="concept" data-id="3-1-c1">…</div>
   ========================================================= */
(function(){
  'use strict';
  function unitOf(id){ return id.slice(0,3); }
  function refreshMini(){
    var el = document.querySelector('[data-unit-progress]'); if(!el) return;
    var p = CH3.progress.unit(el.getAttribute('data-unit-progress'));
    el.querySelector('span').style.width = (p.total ? p.done / p.total * 100 : 0) + '%';
    var t = document.querySelector('[data-unit-progress-text]'); if(t) t.textContent = p.done + ' / ' + p.total + ' 張';
  }
  function initCards(){
    document.querySelectorAll('.concept').forEach(function(card){
      var id = card.getAttribute('data-id');
      var btn = card.querySelector('.got');
      card.setAttribute('tabindex','0'); card.setAttribute('role','button');
      card.setAttribute('aria-label', (card.querySelector('.front h3')||{}).textContent + '（點擊翻面）');
      function paint(){
        var on = CH3.progress.isDone(id);
        card.classList.toggle('done', on);
        if(btn){ btn.setAttribute('aria-pressed', on); btn.textContent = on ? '我懂了 ✓' : '我懂了？'; }
      }
      card.addEventListener('click', function(e){
        if(e.target.closest('.got, .colsel, .rv')) return;
        card.classList.toggle('flipped');
      });
      card.addEventListener('keydown', function(e){
        if((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.got')){ e.preventDefault(); card.classList.toggle('flipped'); }
      });
      if(btn) btn.addEventListener('click', function(e){
        e.stopPropagation();
        var on = !CH3.progress.isDone(id);
        CH3.progress.mark(id, on); paint(); refreshMini();
        if(on){
          var p = CH3.progress.unit(unitOf(id));
          CH3.toast(p.done === p.total ? '🎉 這個單元的概念卡全部完成！' : '已記錄：' + p.done + ' / ' + p.total);
        }
      });
      paint();
    });
    var all = document.getElementById('flipAll');
    if(all) all.addEventListener('click', function(){
      var cards = document.querySelectorAll('.concept');
      var anyFront = Array.prototype.some.call(cards, function(c){ return !c.classList.contains('flipped'); });
      cards.forEach(function(c){ c.classList.toggle('flipped', anyFront); });
      all.textContent = anyFront ? '全部翻回正面' : '全部翻到說明面';
    });
    refreshMini();
    initColSel();
    initReveal(document);
  }
  /* 表格分欄顯示：<div class="colsel" data-table="id"><button data-col="all">全部</button><button data-col="1">…</button></div> */
  function initColSel(){
    document.querySelectorAll('.colsel').forEach(function(bar){
      var table = document.getElementById(bar.getAttribute('data-table')); if(!table) return;
      function show(col){
        bar.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-col') === col); });
        table.style.display = (col === 'all' || !isNaN(Number(col))) ? '' : 'none';
        table.querySelectorAll('tr').forEach(function(tr){
          Array.prototype.forEach.call(tr.children, function(td, i){ td.style.display = (i === 0 || col === 'all' || String(i) === col) ? '' : 'none'; });
        });
        var extra = bar.parentNode.querySelectorAll('[data-colnote]');
        extra.forEach(function(n){ n.style.display = (col === 'all' || n.getAttribute('data-colnote') === col) ? '' : 'none'; });
      }
      bar.addEventListener('click', function(e){ e.stopPropagation(); var b = e.target.closest('[data-col]'); if(b) show(b.getAttribute('data-col')); });
      show('all');
    });
  }
  /* 點一下才顯示答案：class="rv"；按鈕 data-rv-all="show|hide" data-rv-scope="選擇器" */
  function initReveal(root){
    root.querySelectorAll('.rv').forEach(function(r){
      if(r.dataset.rvInit) return; r.dataset.rvInit = 1;
      r.setAttribute('tabindex','0'); r.setAttribute('role','button'); r.setAttribute('aria-label','點一下顯示答案');
      r.addEventListener('click', function(e){ e.stopPropagation(); r.classList.toggle('shown'); });
      r.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); r.classList.toggle('shown'); } });
    });
    root.querySelectorAll('[data-rv-all]').forEach(function(b){
      if(b.dataset.rvInit) return; b.dataset.rvInit = 1;
      b.addEventListener('click', function(){
        var scope = b.closest(b.getAttribute('data-rv-scope') || 'body') || document;
        scope.querySelectorAll('.rv').forEach(function(r){ r.classList.toggle('shown', b.getAttribute('data-rv-all') === 'show'); });
      });
    });
  }
  /* 拖曳排序：ul.sortlist 內的 li（也提供 ▲▼ 按鈕） */
  function sortable(ul){
    function bindLi(li){
      li.querySelectorAll('[data-mv]').forEach(function(btn){
        btn.addEventListener('click', function(e){
          e.stopPropagation();
          if(btn.getAttribute('data-mv') === 'up' && li.previousElementSibling) ul.insertBefore(li, li.previousElementSibling);
          if(btn.getAttribute('data-mv') === 'down' && li.nextElementSibling) ul.insertBefore(li.nextElementSibling, li);
          clearMarks();
        });
      });
      li.addEventListener('pointerdown', function(e){
        if(e.target.closest('button')) return;
        e.preventDefault();
        li.classList.add('dragging'); li.setPointerCapture && li.setPointerCapture(e.pointerId);
        function move(ev){
          var sibs = Array.prototype.filter.call(ul.children, function(x){ return x !== li; });
          for(var i=0;i<sibs.length;i++){
            var r = sibs[i].getBoundingClientRect();
            if(ev.clientY < r.top + r.height / 2){ if(sibs[i] !== li.nextElementSibling) ul.insertBefore(li, sibs[i]); return; }
          }
          ul.appendChild(li);
        }
        function up(){ li.classList.remove('dragging'); li.removeEventListener('pointermove', move); li.removeEventListener('pointerup', up); li.removeEventListener('pointercancel', up); clearMarks(); }
        li.addEventListener('pointermove', move); li.addEventListener('pointerup', up); li.addEventListener('pointercancel', up);
      });
    }
    function clearMarks(){ Array.prototype.forEach.call(ul.children, function(x){ x.classList.remove('ok','ng'); }); }
    Array.prototype.forEach.call(ul.children, bindLi);
  }
  /* 分段按鈕：<div class="seg" data-seg="name"><button data-v="a">…</button></div> */
  function seg(el, onChange){
    var btns = el.querySelectorAll('button');
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        btns.forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
        onChange(b.getAttribute('data-v'));
      });
    });
    var first = el.querySelector('[aria-pressed="true"]') || btns[0];
    btns.forEach(function(x){ x.setAttribute('aria-pressed', x === first); });
    return first.getAttribute('data-v');
  }
  function reduced(){ return document.documentElement.classList.contains('reduce-motion'); }
  /* 簡易音效（心音等），靜音時不播 */
  var actx = null;
  function thump(freq, dur, vol){
    if(CH3.store.get('mute', false)) return;
    try{
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * .5, t + dur);
      g.gain.setValueAtTime(vol || .5, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + .02);
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', initCards);
  window.UNIT = { seg:seg, reduced:reduced, thump:thump, refreshMini:refreshMini, initReveal:initReveal, sortable:sortable };
})();
