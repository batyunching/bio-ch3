/* =========================================================
   遊戲共用：題目彈窗、玩法說明、徽章、最佳紀錄
   需要先載入 common.js、unit.js、data/questions.js
   ========================================================= */
(function(){
  'use strict';
  var used = {};
  function modal(html, cls){
    var bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal '+(cls||'')+'" role="dialog" aria-modal="true">'+html+'</div>';
    document.body.appendChild(bg);
    return { bg:bg, el:bg.querySelector('.modal'), close:function(){ bg.remove(); } };
  }
  /* 從題庫取一題（單選或是非），同一場不重複，用完再洗牌 */
  function pick(units, filter){
    var pool = QB.filter({ units:units, types:['single','tf'] }).filter(filter || function(){ return true; });
    var key = units.join(',');
    used[key] = used[key] || [];
    var fresh = pool.filter(function(q){ return used[key].indexOf(q.id) < 0; });
    if(!fresh.length){ used[key] = []; fresh = pool; }
    var q = fresh[Math.floor(Math.random() * fresh.length)];
    used[key].push(q.id); return q;
  }
  /* 問一題：回傳 Promise<boolean> */
  function ask(opt){
    opt = opt || {};
    var q = opt.question || pick(opt.units || ['3-1','3-2','3-3'], opt.filter);
    return new Promise(function(resolve){
      var order = q.type === 'tf' ? [0,1] : CH3.shuffle(q.options.map(function(_,i){ return i; }));
      var m = modal(
        (opt.title ? '<div class="tag" style="margin-bottom:8px">'+opt.title+'</div>' : '') +
        '<h2 style="font-size:1.25rem">'+q.question+'</h2>' +
        '<div class="opts">' + order.map(function(i){ return '<button class="opt" data-i="'+i+'">'+(q.type === 'tf' ? (i === 0 ? '⭕ 正確' : '❌ 錯誤') : q.options[i])+'</button>'; }).join('') + '</div>' +
        '<div class="fb" style="display:none"></div><div style="text-align:right;margin-top:12px"><button class="btn" data-go style="display:none">繼續 ▶</button></div>',
        CH3.unitClass(q.unit));
      var ok = false;
      m.el.querySelectorAll('.opt').forEach(function(b){
        b.addEventListener('click', function(){
          var i = Number(b.getAttribute('data-i')); ok = i === q.answer;
          m.el.querySelectorAll('.opt').forEach(function(o){ o.disabled = true; if(Number(o.getAttribute('data-i')) === q.answer) o.classList.add('correct'); });
          var inBank = !!QB.byId(q.id);
          if(!ok){ b.classList.add('wrong'); if(inBank) CH3.wrongBook.add(q.id); } else if(inBank) CH3.wrongBook.remove(q.id);
          if(inBank) CH3.record(q, ok, i, 'game');
          var fb = m.el.querySelector('.fb'); fb.style.display = ''; fb.className = 'fb ' + (ok ? 'ok' : 'ng');
          fb.innerHTML = '<b>' + (ok ? '✅ 答對了！' + (opt.okText ? ' ' + opt.okText : '') : '❌ 答錯了' + (opt.ngText ? '：' + opt.ngText : '（已放進錯題本）')) + '</b><br>💡 ' + q.explain;
          UNIT.thump(ok ? 520 : 140, .15, .4);
          var go = m.el.querySelector('[data-go]'); go.style.display = ''; go.focus();
        });
      });
      m.el.querySelector('[data-go]').addEventListener('click', function(){ m.close(); resolve(ok); });
    });
  }
  /* 玩法說明（可跳過） */
  function intro(key, title, steps, cb){
    var m = modal('<h2>'+title+'</h2><ol class="steps" style="margin-top:4px">' + steps.map(function(s){ return '<li class="on">'+s+'</li>'; }).join('') + '</ol>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-skip style="width:22px;height:22px"> 下次不要再顯示</label><button class="btn" data-ok>開始遊戲 ▶</button></div>');
    m.el.querySelector('[data-ok]').addEventListener('click', function(){
      if(m.el.querySelector('[data-skip]').checked) CH3.store.set('introSkip.' + key, true);
      m.close(); if(cb) cb();
    });
  }
  function introOnce(key, title, steps, cb){ if(CH3.store.get('introSkip.' + key, false)){ if(cb) cb(); return; } intro(key, title, steps, cb); }
  /* 徽章 */
  var BADGES = {
    plumber:{ ic:'🔧', name:'水管大師', how:'植物水管工 5 關全部過關' },
    courier:{ ic:'🏅', name:'金牌快遞', how:'血液快遞個人模式拿到 2 個快遞章以上' },
    immune: { ic:'🛡️', name:'免疫專家', how:'防禦大作戰擊敗第 5 波首領' },
    bingo:  { ic:'🎯', name:'賓果王', how:'運輸賓果達成 3 條線（第5階段）' }
  };
  function unlock(id){
    var b = CH3.store.get('badges', {}); if(b[id]) return false;
    b[id] = Date.now(); CH3.store.set('badges', b);
    var d = BADGES[id], p = document.createElement('div'); p.className = 'badge-pop';
    p.innerHTML = '<div class="big">'+d.ic+'</div><h2 style="margin:6px 0">獲得徽章：'+d.name+'</h2><p style="margin:0;color:var(--c-muted)">'+d.how+'</p>';
    document.body.appendChild(p); requestAnimationFrame(function(){ p.classList.add('show'); });
    UNIT.thump(660, .2, .5); setTimeout(function(){ UNIT.thump(880, .3, .5); }, 180);
    setTimeout(function(){ p.classList.remove('show'); setTimeout(function(){ p.remove(); }, 400); }, 2600);
    return true;
  }
  /* 最佳紀錄 */
  function best(key, val, lowerBetter){
    var all = CH3.store.get('best', {}), old = all[key];
    var better = old == null || (lowerBetter ? val < old : val > old);
    if(better){ all[key] = val; CH3.store.set('best', all); }
    return { best: better ? val : old, isNew: better };
  }
  /* 回到遊戲大廳：頁面上任何 [data-lobby] 按鈕，以及右下角的浮動按鈕 */
  function toLobby(){
    if(window.GAME.inProgress && window.GAME.inProgress()){
      var m = modal('<h2>要回到遊戲大廳嗎？</h2><p>這一局還沒結束，離開後<b>這一局的進度不會保存</b>（徽章和最佳紀錄不受影響）。</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn ghost" data-no>繼續玩</button><button class="btn" data-yes>🎮 回到遊戲大廳</button></div>');
      m.el.querySelector('[data-no]').addEventListener('click', function(){ m.close(); if(window.GAME.onResume) window.GAME.onResume(); });
      m.el.querySelector('[data-yes]').addEventListener('click', function(){ location.href = 'index.html'; });
      return;
    }
    location.href = 'index.html';
  }
  document.addEventListener('DOMContentLoaded', function(){
    if(document.body.getAttribute('data-game') == null) return;
    var f = document.createElement('button');
    f.className = 'btn lobby-fab'; f.setAttribute('data-lobby', ''); f.innerHTML = '🎮 遊戲大廳';
    document.body.appendChild(f);
    document.addEventListener('click', function(e){ if(e.target.closest('[data-lobby]')){ e.preventDefault(); toLobby(); } });
  });
  window.GAME = { modal:modal, ask:ask, pick:pick, intro:intro, introOnce:introOnce, unlock:unlock, best:best, BADGES:BADGES, toLobby:toLobby, inProgress:null };
})();
