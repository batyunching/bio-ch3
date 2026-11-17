/* =========================================================
   實驗 3-2 探測心音和脈搏
   ========================================================= */
(function(){
  'use strict';
  var OXY = '#E53935', DEOXY = '#8E1B1B';

  /* ---------- 原理動畫 ---------- */
  window.LAB_SIMS.sim32p = function(box){
    box.innerHTML =
      '<div class="anim"><div class="bar"><button class="btn blood" data-play>▶ 播放</button><span class="sp"></span><button class="icon-btn" data-mute>🔊</button></div><div class="anim-body">' +
      '<div class="stagebox"><svg viewBox="0 0 500 360" role="img" aria-label="心音與脈搏原理"></svg></div>' +
      '<div class="info"><h3>原理</h3><div class="sound" style="font-size:2rem;font-weight:900;color:var(--u-d);height:44px" data-snd></div><div data-txt></div></div></div></div>';
    var svg = box.querySelector('svg'), txt = box.querySelector('[data-txt]'), snd = box.querySelector('[data-snd]');
    var phase = 0, timer = null;
    function draw(){
      var vC = phase === 1, h = '';
      h += '<rect width="500" height="360" fill="#FBFBF7"/>';
      // 心房、心室
      h += '<rect x="70" y="40" width="150" height="90" rx="30" fill="'+OXY+'"/><text x="145" y="92" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">心房</text>';
      h += '<rect x="'+(vC?82:70)+'" y="'+(vC?158:150)+'" width="'+(vC?126:150)+'" height="'+(vC?150:170)+'" rx="40" fill="'+OXY+'"/><text x="145" y="245" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">心室</text>';
      // 房室瓣
      h += vC ? '<path d="M90 140 H200" stroke="#263238" stroke-width="6" stroke-linecap="round"/>' : '<path d="M90 140 L112 158 M200 140 L178 158" stroke="#263238" stroke-width="6" stroke-linecap="round"/>';
      // 動脈
      var aw = vC ? 46 : 34;
      h += '<rect x="220" y="'+(190 - aw/2)+'" width="250" height="'+aw+'" rx="'+(aw/2)+'" fill="#EF5350"/><text x="400" y="'+(190 - aw/2 - 10)+'" text-anchor="middle" font-size="15" font-weight="900" fill="#C62828">動脈</text>';
      // 動脈瓣
      h += vC ? '<path d="M214 170 L232 160 M214 210 L232 220" stroke="#263238" stroke-width="6" stroke-linecap="round"/>' : '<path d="M216 168 V212" stroke="#263238" stroke-width="6" stroke-linecap="round"/>';
      if(vC) h += '<path d="M180 230 C240 190 260 190 330 190" stroke="#fff" stroke-width="6" fill="none" marker-end="url(#mw)"/>';
      else h += '<path d="M145 60 V200" stroke="#fff" stroke-width="6" fill="none" marker-end="url(#mw)"/>';
      h += '<defs><marker id="mw" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fff"/></marker></defs>';
      h += '<text x="345" y="290" text-anchor="middle" font-size="15" font-weight="700" fill="#6D4C41">'+(vC ? '動脈管彈性擴張 → 脈搏' : '動脈管彈性恢復')+'</text>';
      svg.innerHTML = h;
      txt.innerHTML = vC
        ? '<p><b>心室收縮</b>：血液流入動脈，<b>房室間的瓣膜關閉</b> → 血液撞擊瓣膜產生第一個心音「<b>撲</b>」。</p><p>動脈管被撐開（擴張）→ 摸到一次<b>脈搏</b>。</p>'
        : '<p><b>心室舒張</b>：<b>心室與動脈間的瓣膜關閉</b> → 產生第二個心音「<b>通</b>」。</p><p>動脈管彈性恢復。</p><p style="color:var(--c-muted)">心臟跳一次 ＝「撲、通」兩個心音 ＝ 一次脈搏。</p>';
    }
    function tick(){
      phase = phase === 1 ? 2 : 1;
      snd.textContent = phase === 1 ? '撲～' : '通！';
      UNIT.thump(phase === 1 ? 70 : 110, phase === 1 ? .18 : .12, .6);
      draw();
    }
    box.querySelector('[data-play]').addEventListener('click', function(){
      if(timer){ clearInterval(timer); timer = null; this.textContent = '▶ 播放'; return; }
      this.textContent = '⏸ 暫停'; tick(); timer = setInterval(tick, 900);
    });
    var mb = box.querySelector('[data-mute]');
    function paintMute(){ mb.textContent = CH3.store.get('mute', false) ? '🔇' : '🔊'; }
    mb.addEventListener('click', function(){ CH3.store.set('mute', !CH3.store.get('mute', false)); paintMute(); });
    paintMute(); phase = 2; draw(); snd.textContent = '';
  };

  /* ---------- 測量心搏與脈搏 ---------- */
  window.LAB_SIMS.sim32a = function(box){
    box.innerHTML =
      '<div class="anim"><div class="bar"><button class="tool" data-tool="steth">🩺 聽診器（薄膜面）</button><button class="tool" data-tool="finger">✌️ 食指＋中指</button>' +
      '<span class="sp"></span><label class="chk" style="display:flex;gap:6px;align-items:center;font-weight:700"><input type="checkbox" data-ff checked style="width:22px;height:22px"> ⏩ 快轉（1 分鐘縮成 10 秒）</label>' +
      '<label style="display:flex;gap:6px;align-items:center;font-weight:700"><input type="checkbox" data-auto style="width:22px;height:22px"> 自動計數</label></div>' +
      '<div class="anim-body"><div class="stagebox"><svg viewBox="0 0 500 420" role="img" aria-label="測量心音與脈搏的人像"></svg></div>' +
      '<div class="info"><div data-msg></div><div class="bigcount" data-count>0</div><div style="text-align:center;font-weight:700" data-timer>⏱ 0 秒</div>' +
      '<div class="ops" style="justify-content:center"><button class="btn blood" data-start disabled>▶ 開始計時 1 分鐘</button><button class="btn" data-tap disabled style="min-width:140px">👆 ＋1 下</button></div>' +
      '<table class="datatable"><tr><th colspan="2">運動前（次／分鐘）</th><th colspan="2">運動後（次／分鐘）</th></tr><tr><th>心搏</th><th>脈搏</th><th>心搏</th><th>脈搏</th></tr><tr><td data-cell="A">A</td><td data-cell="B">B</td><td data-cell="C">C</td><td data-cell="D">D</td></tr></table>' +
      '<div class="ops"><button class="btn ghost" data-ex disabled>🏃 原地運動 2 分鐘</button><button class="btn ghost" data-reset>↺ 重來</button></div><div data-res></div></div></div></div>';
    var svg = box.querySelector('svg'), msg = box.querySelector('[data-msg]'), cnt = box.querySelector('[data-count]'), tmr = box.querySelector('[data-timer]');
    var bStart = box.querySelector('[data-start]'), bTap = box.querySelector('[data-tap]'), bEx = box.querySelector('[data-ex]'), res = box.querySelector('[data-res]');
    var RATE = { before: 68 + Math.floor(Math.random()*10), after: 108 + Math.floor(Math.random()*14) };
    var s = { phase:'before', tool:'', rec:{}, running:false, exercising:false };
    var tools = {};
    function person(){
      var h = '<rect width="500" height="420" fill="#FBFBF7"/>';
      var jump = s.exercising ? ' transform="translate(0 -14)"' : '';
      h += '<g'+jump+' class="'+(s.exercising?'jumping':'')+'">';
      h += '<circle cx="250" cy="70" r="44" fill="#FFE0BD" stroke="#D7A86E" stroke-width="2"/><path d="M206 62 C206 20 294 20 294 62 C280 40 220 40 206 62Z" fill="#5D4037"/>';
      h += '<circle cx="234" cy="74" r="4" fill="#3E2723"/><circle cx="266" cy="74" r="4" fill="#3E2723"/><path d="M240 92 q10 7 20 0" stroke="#3E2723" stroke-width="3" fill="none" stroke-linecap="round"/>';
      h += '<path d="M170 130 Q250 108 330 130 L340 330 H160Z" fill="#90CAF9" stroke="#64B5F6" stroke-width="2"/>';
      h += '<path d="M172 136 L110 270 L128 280 L186 170Z" fill="#90CAF9" stroke="#64B5F6" stroke-width="2"/><circle cx="118" cy="282" r="16" fill="#FFE0BD"/>';
      h += '<path d="M328 136 L400 250 L430 330 L410 338 L382 262 L316 172Z" fill="#90CAF9" stroke="#64B5F6" stroke-width="2"/>';
      h += '<path d="M402 330 L438 322 L452 368 L420 380 Z" fill="#FFE0BD" stroke="#D7A86E" stroke-width="2"/><path d="M438 330 l18 -10" stroke="#D7A86E" stroke-width="8" stroke-linecap="round"/>';
      h += '<text x="250" y="360" text-anchor="middle" font-size="13" fill="#78909C">（面對你的同學：圖的右側是他的左側）</text>';
      h += '</g>';
      if(tools.steth) h += '<g transform="translate('+tools.steth.x+' '+tools.steth.y+')"><circle r="18" fill="#B0BEC5" stroke="#455A64" stroke-width="3"/><circle r="10" fill="#ECEFF1"/><g data-beat="chest" opacity="0"><text x="22" y="-14" font-size="18" font-weight="900" fill="#C62828">撲通</text></g></g>';
      if(tools.finger) h += '<g transform="translate('+tools.finger.x+' '+tools.finger.y+')"><circle data-beat="wrist" r="16" fill="none" stroke="#E53935" stroke-width="3" opacity="0"/><text x="-14" y="8" font-size="26">✌️</text></g>';
      svg.innerHTML = h;
    }
    function inChest(x, y){ return x > 262 && x < 332 && y > 140 && y < 230; }
    function inWrist(x, y){ return x > 396 && x < 460 && y > 318 && y < 384; }
    var dropS = window.makeDrop(box.querySelector('[data-tool="steth"]'), '🩺', svg, function(x, y){
      if(s.running || s.exercising) return '計時中，請等一下';
      if(inChest(x, y)) return 'ok';
      if(x > 168 && x < 262 && y > 130 && y < 260) return '這是右胸，心臟在胸腔中央偏「左」喔！（圖的右側）';
      return '請把聽診器的薄膜面放在左胸前';
    }, function(x, y){ tools.steth = {x:x, y:y}; delete tools.finger; dropF.reset(); s.tool = 'steth'; ready(); });
    var dropF = window.makeDrop(box.querySelector('[data-tool="finger"]'), '✌️', svg, function(x, y){
      if(s.running || s.exercising) return '計時中，請等一下';
      if(inWrist(x, y)) return 'ok';
      if(x < 160 && y > 250) return '換另一隻手，量大拇指內側的手腕';
      return '用食指和中指輕按「大拇指內側的手腕」';
    }, function(x, y){ tools.finger = {x:x, y:y}; delete tools.steth; dropS.reset(); s.tool = 'finger'; ready(); });
    function slot(){ return s.phase === 'before' ? (s.tool === 'steth' ? 'A' : 'B') : (s.tool === 'steth' ? 'C' : 'D'); }
    function ready(){
      person();
      bStart.disabled = false;
      msg.innerHTML = '<h3>'+(s.tool === 'steth' ? '🩺 聽心音（數心搏）' : '✌️ 摸脈搏')+'・'+(s.phase === 'before' ? '運動前' : '運動後')+'</h3><p>按「開始計時」，每'+(s.tool === 'steth' ? '聽到一組「撲、通」' : '摸到一次跳動')+'就按「＋1」。結果會記在表格的 <b>'+slot()+'</b>。</p>';
    }
    var count = 0, trueCount = 0, beatT = null, endT = null, clockT = null;
    function beat(){
      trueCount++;
      var g = svg.querySelector('[data-beat]');
      if(g){ g.setAttribute('opacity', 1); setTimeout(function(){ g.setAttribute('opacity', 0); }, 220); }
      if(s.tool === 'steth'){ UNIT.thump(70, .14, .6); setTimeout(function(){ UNIT.thump(110, .1, .5); }, 180); }
      if(box.querySelector('[data-auto]').checked){ count++; cnt.textContent = count; }
    }
    bStart.addEventListener('click', function(){
      if(s.running) return;
      var sp = box.querySelector('[data-ff]').checked ? 6 : 1, rate = RATE[s.phase];
      s.running = true; count = 0; trueCount = 0; cnt.textContent = 0; bStart.disabled = true; bTap.disabled = false;
      var dur = 60000 / sp, t0 = Date.now();
      beatT = setInterval(beat, 60000 / rate / sp);
      clockT = setInterval(function(){ var e = (Date.now() - t0) * sp / 1000; tmr.textContent = '⏱ ' + Math.min(60, Math.floor(e)) + ' 秒' + (sp > 1 ? '（快轉中）' : ''); }, 100);
      endT = setTimeout(finish, dur);
    });
    bTap.addEventListener('click', function(){ if(!s.running) return; count++; cnt.textContent = count; });
    function finish(){
      clearInterval(beatT); clearInterval(clockT); s.running = false; bTap.disabled = true; tmr.textContent = '⏱ 60 秒';
      var k = slot(); s.rec[k] = count;
      var td = box.querySelector('[data-cell="'+k+'"]'); td.innerHTML = '<b>'+count+'</b>';
      var diff = Math.abs(count - trueCount);
      msg.innerHTML = '<h3>記錄完成：'+k+' ＝ '+count+' 次／分</h3>' + (diff > 3 ? '<div class="warn">實際跳了 '+trueCount+' 次，你數到 '+count+' 次，可能漏數了。可以按「重來」再量一次，或勾選「自動計數」。</div>' : '<div class="good">數得很準！</div>') +
        '<p>' + nextHint() + '</p>';
      bEx.disabled = !(s.rec.A != null && s.rec.B != null && s.phase === 'before');
      tools = {}; dropS.reset(); dropF.reset(); s.tool = ''; person();
      if(s.rec.C != null && s.rec.D != null) conclude();
    }
    function nextHint(){
      if(s.phase === 'before'){
        if(s.rec.A == null) return '接著把<b>聽診器</b>放到左胸前，量運動前的心搏（A）。';
        if(s.rec.B == null) return '接著把<b>食指＋中指</b>放到手腕，量運動前的脈搏（B）。';
        return '運動前都量好了！按「🏃 原地運動 2 分鐘」。';
      }
      if(s.rec.C == null) return '運動後，用<b>聽診器</b>量心搏（C）。';
      if(s.rec.D == null) return '再用<b>食指＋中指</b>量脈搏（D）。';
      return '';
    }
    bEx.addEventListener('click', function(){
      bEx.disabled = true; s.exercising = true; var n = 0;
      msg.innerHTML = '<h3>🏃 原地運動中…</h3><p>原地跑跳 2 分鐘（模擬中快轉）。</p>';
      var jt = setInterval(function(){ s.exercising = n % 2 === 0; person(); n++; if(n > 10){ clearInterval(jt); s.exercising = false; s.phase = 'after'; person(); msg.innerHTML = '<h3>運動完成！</h3><p>'+nextHint()+'</p>'; } }, UNIT.reduced() ? 120 : 300);
    });
    function conclude(){
      var r = s.rec;
      res.innerHTML = '<div class="good">📊 結果：運動前 A＝'+r.A+'、B＝'+r.B+'；運動後 C＝'+r.C+'、D＝'+r.D+'。<br>' +
        '理論上 <b>A＝B、C＝D</b>（脈搏來自心搏），而且 <b>(A＝B)＜(C＝D)</b>（運動使心搏加速）。' +
        ((Math.abs(r.A - r.B) > 3 || Math.abs(r.C - r.D) > 3) ? '<br>你的心搏和脈搏差比較多，想一想：可能是哪裡數錯了？' : '<br>你的數據符合理論，太棒了！') + '</div>';
    }
    box.querySelector('[data-reset]').addEventListener('click', function(){
      clearInterval(beatT); clearInterval(clockT); clearTimeout(endT);
      s = { phase:'before', tool:'', rec:{}, running:false, exercising:false }; tools = {}; dropS.reset(); dropF.reset();
      ['A','B','C','D'].forEach(function(k){ box.querySelector('[data-cell="'+k+'"]').textContent = k; });
      cnt.textContent = 0; tmr.textContent = '⏱ 0 秒'; bStart.disabled = true; bTap.disabled = true; bEx.disabled = true; res.innerHTML = '';
      intro(); person();
    });
    function intro(){ msg.innerHTML = '<h3>兩人一組</h3><p>甲是受測者、乙是計時者。先把上方的 <b>🩺 聽診器</b> 拖到（或點一下再點）甲的<b>左胸前</b>。</p>'; }
    intro(); person();

    /* ---- 手動輸入模式：量自己真實的心跳 ---- */
    var anim = box.querySelector('.anim'), simBar = anim.querySelector('.bar'), simBody = anim.querySelector('.anim-body');
    var modeBar = document.createElement('div');
    modeBar.className = 'bar';
    modeBar.innerHTML = '<div class="seg" data-mode><button data-v="sim" aria-pressed="true">🤖 模擬心跳</button><button data-v="manual">✍️ 手動輸入（量自己真實的心跳）</button></div>';
    anim.insertBefore(modeBar, simBar);
    var man = document.createElement('div');
    man.style.display = 'none';
    man.innerHTML =
      '<div class="anim-body"><div class="card">' +
        '<h3>✍️ 量自己的心搏和脈搏</h3><ol style="padding-left:1.2em;margin:0">' +
        '<li>兩人一組：甲是受測者，乙是計時者。</li>' +
        '<li>甲用聽診器<b>薄膜面</b>放在<b>左胸前</b>，數 1 分鐘的心搏（「撲、通」算 1 次）→ 填 <b>A</b>。</li>' +
        '<li>乙用<b>食指和中指</b>輕按甲<b>大拇指內側的手腕</b>，數 1 分鐘的脈搏 → 填 <b>B</b>。</li>' +
        '<li>甲<b>原地運動 2 分鐘</b>後，馬上再量心搏 → <b>C</b>、脈搏 → <b>D</b>。</li>' +
        '<li>甲、乙交換，再做一次。</li></ol>' +
        '<p style="color:var(--c-muted);font-size:.9rem">⚠ 請勿拍打聽診器薄膜。老師也可以統一計時，教室保持安靜比較容易聽清楚。</p>' +
        '<div class="bigcount" data-mclock>60</div><div style="text-align:center;font-weight:700" data-mlabel>秒</div>' +
        '<div class="ops" style="justify-content:center"><button class="btn blood" data-mstart>▶ 開始計時 1 分鐘</button><button class="btn ghost" data-mex>🏃 運動 2 分鐘計時</button><button class="btn ghost" data-mstop>⏹ 停止</button></div>' +
      '</div><div class="info">' +
        '<h3>我的紀錄（次／分鐘）</h3>' +
        '<table class="datatable"><tr><th colspan="2">運動前</th><th colspan="2">運動後</th></tr><tr><th>心搏</th><th>脈搏</th><th>心搏</th><th>脈搏</th></tr>' +
        '<tr><td><input inputmode="numeric" data-mi="A" placeholder="A"></td><td><input inputmode="numeric" data-mi="B" placeholder="B"></td><td><input inputmode="numeric" data-mi="C" placeholder="C"></td><td><input inputmode="numeric" data-mi="D" placeholder="D"></td></tr></table>' +
        '<div class="ops"><button class="btn blood" data-mcmp>📊 比較結果</button><button class="btn ghost" data-mclear>清除</button></div><div data-mres></div>' +
      '</div></div>';
    anim.appendChild(man);
    var mt = null;
    function mTimer(sec, label){
      clearInterval(mt); var end = Date.now() + sec * 1000;
      man.querySelector('[data-mlabel]').textContent = label;
      mt = setInterval(function(){
        var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        man.querySelector('[data-mclock]').textContent = left >= 60 ? Math.floor(left/60) + ':' + ('0' + left%60).slice(-2) : left;
        if(left <= 0){ clearInterval(mt); mt = null; UNIT.thump(660, .5, .6); setTimeout(function(){ UNIT.thump(660, .5, .6); }, 600); CH3.toast('⏰ 時間到！'); man.querySelector('[data-mlabel]').textContent = '時間到！'; }
      }, 200);
    }
    man.querySelector('[data-mstart]').addEventListener('click', function(){ mTimer(60, '秒（數心搏或脈搏）'); });
    man.querySelector('[data-mex]').addEventListener('click', function(){ mTimer(120, '原地運動中'); });
    man.querySelector('[data-mstop]').addEventListener('click', function(){ clearInterval(mt); mt = null; man.querySelector('[data-mclock]').textContent = '60'; man.querySelector('[data-mlabel]').textContent = '秒'; });
    man.querySelector('[data-mclear]').addEventListener('click', function(){ man.querySelectorAll('[data-mi]').forEach(function(i){ i.value = ''; i.style.borderColor = ''; }); man.querySelector('[data-mres]').innerHTML = ''; });
    man.querySelector('[data-mcmp]').addEventListener('click', function(){
      var v = {}, bad = false;
      man.querySelectorAll('[data-mi]').forEach(function(i){
        var n = parseInt(i.value, 10), k = i.getAttribute('data-mi');
        var ok = !isNaN(n) && n >= 30 && n <= 220;
        i.style.borderColor = ok ? 'var(--c-ok)' : 'var(--c-ng)'; if(!ok) bad = true; v[k] = n;
      });
      var out = man.querySelector('[data-mres]');
      if(bad){ out.innerHTML = '<div class="warn">請把 A、B、C、D 都填上合理的數字（每分鐘 30～220 次）。</div>'; return; }
      var h = '<div class="good" style="color:var(--c-text)">';
      var eq1 = Math.abs(v.A - v.B) <= 3, eq2 = Math.abs(v.C - v.D) <= 3;
      h += '<p>① 運動前：A＝'+v.A+'、B＝'+v.B+' → ' + (eq1 ? '<b>幾乎相同 ✔</b>' : '相差 '+Math.abs(v.A-v.B)+' 次') + '</p>';
      h += '<p>② 運動後：C＝'+v.C+'、D＝'+v.D+' → ' + (eq2 ? '<b>幾乎相同 ✔</b>' : '相差 '+Math.abs(v.C-v.D)+' 次') + '</p>';
      h += '<p>③ 運動前後：' + (Math.min(v.C, v.D) > Math.max(v.A, v.B) ? '運動後<b>比較快 ✔</b>（增加約 '+Math.round((v.C+v.D-v.A-v.B)/2)+' 次）' : '運動後沒有變快，可能運動量不夠，或休息太久才量') + '</p>';
      h += '<p><b>理論：</b>脈搏來自心搏，所以 A＝B、C＝D；運動使心搏加速，所以 (A＝B)＜(C＝D)。</p>';
      if(!eq1 || !eq2) h += '<p>心搏和脈搏差比較多，想一想：是不是有一方漏數了，或兩人開始、結束的時間不一致？</p>';
      out.innerHTML = h + '</div>';
    });
    UNIT.seg(modeBar.querySelector('[data-mode]'), function(m){
      var manual = m === 'manual';
      simBar.style.display = simBody.style.display = manual ? 'none' : '';
      man.style.display = manual ? '' : 'none';
    });
  };
})();
