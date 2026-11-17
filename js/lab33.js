/* =========================================================
   實驗 3-3 血液流動的觀察（小魚尾鰭，完全虛擬）
   ========================================================= */
(function(){
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for(var k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }

  window.LAB_SIMS.sim33a = function(box){
    box.innerHTML =
      '<div class="anim"><div class="bar"><button class="tool" data-tool="cotton">☁️ 沾溼的化妝棉</button><span class="sp"></span>' +
      '<div style="min-width:220px;display:none" data-stam><div style="font-weight:700;font-size:.85rem">🐟 小魚體力</div><div class="stamina"><span style="width:100%"></span></div></div></div>' +
      '<div class="anim-body"><div class="stagebox"><svg viewBox="0 0 500 420" role="img" aria-label="小魚尾鰭血流觀察"></svg></div>' +
      '<div class="info"><div data-msg></div><div class="ops" data-ops></div><div data-extra></div></div></div></div>';
    var svg = box.querySelector('svg'), msg = box.querySelector('[data-msg]'), ops = box.querySelector('[data-ops]'), extra = box.querySelector('[data-extra]');
    var stamBox = box.querySelector('[data-stam]'), stamBar = stamBox.querySelector('span');
    var s = { st:0, focus:20, raised:false, high:false, stamina:100, flipped:false, ids:{}, resting:false };
    var cotton = window.makeDrop(box.querySelector('[data-tool="cotton"]'), '☁️', svg, function(x, y){
      if(s.st !== 1) return '先把小魚放進培養皿';
      if(x < 215 && y > 120 && y < 300) return 'ok';
      if(x > 300) return '⚠ 尾鰭要完整露出來才看得到血管！化妝棉要蓋在頭部和鰓蓋';
      return '化妝棉要蓋住小魚的「頭部與鰓蓋」';
    }, function(){ s.st = 2; render(); });

    /* ---- 場景：培養皿與小魚 ---- */
    function dishScene(){
      var h = '<rect width="500" height="420" fill="#FBFBF7"/>';
      h += '<ellipse cx="250" cy="215" rx="230" ry="170" fill="#E1F5FE" stroke="#90A4AE" stroke-width="4"/>';
      if(s.st >= 1){
        h += '<g><path d="M110 210 C110 170 190 150 260 170 C300 180 330 196 345 210 C330 224 300 240 260 250 C190 270 110 250 110 210Z" fill="#FFB74D" stroke="#EF6C00" stroke-width="2"/>';
        h += '<path d="M340 210 L440 140 C430 180 430 240 440 280 Z" fill="#FFE0B2" stroke="#EF6C00" stroke-width="2" opacity=".85"/>';
        h += '<g stroke="#FFAB91" stroke-width="1.5"><path d="M350 205 L430 152 M350 210 L432 210 M350 215 L430 268 M352 208 L432 180 M352 212 L432 240"/></g>';
        h += '<circle cx="140" cy="200" r="7" fill="#fff"/><circle cx="140" cy="200" r="3.5" fill="#263238"/><path d="M170 180 C180 200 180 220 170 240" stroke="#EF6C00" stroke-width="2" fill="none"/>';
        h += '<text x="390" y="320" text-anchor="middle" font-size="14" font-weight="900" fill="#EF6C00">尾鰭（扁平透光）</text>';
        if(s.st >= 2) h += '<path d="M96 170 C80 200 84 240 100 262 C140 280 190 270 205 250 C214 220 210 180 196 160 C160 146 120 150 96 170Z" fill="#fff" stroke="#B0BEC5" stroke-width="2" opacity=".95"/><text x="150" y="216" text-anchor="middle" font-size="13" font-weight="700" fill="#78909C">沾溼的化妝棉</text>';
        h += '</g>';
      } else {
        h += '<text x="250" y="220" text-anchor="middle" font-size="18" font-weight="700" fill="#90A4AE">培養皿（空的）</text>';
      }
      return h;
    }
    /* ---- 顯微鏡視野 ---- */
    var paths = {}, cells = [], fieldG = null, flowOn = false;
    var VES = {
      art: { d:'M460 120 L40 120', w:16, speed:150, n:13 },
      c1:  { d:'M370 120 C360 170 350 230 340 300', w:7, speed:26, n:4 },
      c2:  { d:'M260 120 C270 175 250 240 240 300', w:7, speed:24, n:4 },
      c3:  { d:'M150 120 C140 175 155 240 140 300', w:7, speed:26, n:4 },
      vein:{ d:'M40 300 L460 300', w:26, speed:80, n:16 }
    };
    function fieldScene(){
      svg.innerHTML = '';
      var defs = el('defs', {}, svg);
      var cp = el('clipPath', { id:'fieldClip' }, defs); el('circle', { cx:250, cy:210, r:195 }, cp);
      var fl = el('filter', { id:'blurF' }, defs); el('feGaussianBlur', { stdDeviation:0, id:'blurStd' }, fl);
      el('rect', { width:500, height:420, fill:'#263238' }, svg);
      var wrap = el('g', { 'clip-path':'url(#fieldClip)' }, svg);
      fieldG = el('g', { filter:'url(#blurF)' }, wrap);
      var inner = el('g', { id:'fieldInner' }, fieldG);
      el('rect', { x:40, y:10, width:420, height:410, fill:'#FFF8E1' }, inner);
      for(var i=0;i<9;i++) el('line', { x1:20 + i*60, y1:0, x2:-60 + i*60, y2:420, stroke:'#FFE0B2', 'stroke-width':10 }, inner);
      Object.keys(VES).forEach(function(k){
        var v = VES[k];
        el('path', { d:v.d, stroke:'#FFCDD2', 'stroke-width':v.w + 6, fill:'none', 'stroke-linecap':'round', 'data-v':k, class:'vsl' }, inner);
        paths[k] = el('path', { d:v.d, stroke:'#FFEBEE', 'stroke-width':v.w, fill:'none', 'stroke-linecap':'round', 'data-v':k, class:'vsl' }, inner);
      });
      // 標籤
      [['甲',250,98,'art'],['乙',284,212,'c2'],['丙',250,336,'vein']].forEach(function(l){
        var g = el('g', { class:'vlabel', 'data-v':l[3], style:'cursor:pointer' }, inner);
        el('circle', { cx:l[1], cy:l[2], r:15, fill:'#fff', stroke:'#455A64', 'stroke-width':2 }, g);
        var t = el('text', { x:l[1], y:l[2] + 5, 'text-anchor':'middle', 'font-size':15, 'font-weight':900, fill:'#263238' }, g); t.textContent = l[0];
      });
      cells = [];
      var cg = el('g', {}, inner);
      Object.keys(VES).forEach(function(k){
        var v = VES[k], len = paths[k].getTotalLength();
        for(var i=0;i<v.n;i++){
          var off = k === 'art' || k === 'vein' ? ((i % 3) - 1) * v.w * 0.25 : 0;
          var e = el('ellipse', { rx: k.charAt(0) === 'c' ? 4 : 5.5, ry: k.charAt(0) === 'c' ? 3 : 4, fill:'#FF7043', stroke:'#D84315', 'stroke-width':1 }, cg);
          cells.push({ el:e, k:k, len:len, d:(i / v.n) * len + Math.random() * 6, off:off });
        }
      });
      // 視野外框與文字
      el('circle', { cx:250, cy:210, r:195, fill:'none', stroke:'#000', 'stroke-width':6 }, svg);
      var cap = el('text', { x:250, y:410, 'text-anchor':'middle', 'font-size':14, 'font-weight':900, fill:'#fff', id:'fieldCap' }, svg);
      cap.textContent = s.high ? '高倍物鏡・視野下' : '低倍物鏡・視野下';
      applyFlip(); applyBlur();
    }
    function applyBlur(){ var b = svg.querySelector('#blurStd'); if(b) b.setAttribute('stdDeviation', s.st === 3 ? Math.min(9, Math.abs(s.focus - 62) / 5).toFixed(2) : 0); }
    function applyFlip(){
      var inner = svg.querySelector('#fieldInner'); if(!inner) return;
      inner.setAttribute('transform', s.flipped ? 'rotate(180 250 210)' : '');
      var cap = svg.querySelector('#fieldCap'); if(cap) cap.textContent = s.flipped ? '實際情形（把視野轉 180°）' : (s.high ? '高倍物鏡・視野下' : '低倍物鏡・視野下');
      svg.querySelectorAll('.vlabel text').forEach(function(t){ t.setAttribute('transform', s.flipped ? 'rotate(180 '+t.getAttribute('x')+' '+(Number(t.getAttribute('y'))-5)+')' : ''); });
    }
    var last = 0, raf = null;
    function tick(ts){
      var dt = Math.min(60, ts - (last || ts)) / 1000; last = ts;
      if(flowOn && document.body.contains(svg) && svg.getBoundingClientRect().width > 0){
        var slow = s.stamina < 30 ? (0.2 + s.stamina / 60) : 1;
        if(UNIT.reduced()) slow *= .4;
        cells.forEach(function(c){
          c.d = (c.d + VES[c.k].speed * slow * dt) % c.len;
          var p = paths[c.k].getPointAtLength(c.d), p2 = paths[c.k].getPointAtLength(Math.min(c.len, c.d + 1));
          var ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
          var nx = -(p2.y - p.y), ny = (p2.x - p.x), nl = Math.hypot(nx, ny) || 1;
          c.el.setAttribute('transform', 'translate('+(p.x + nx/nl*c.off).toFixed(1)+' '+(p.y + ny/nl*c.off).toFixed(1)+') rotate('+ang.toFixed(0)+')');
        });
        if(s.st === 5 && !s.resting){
          s.stamina = Math.max(0, s.stamina - dt * 100 / 70);
          stamBar.style.width = s.stamina + '%';
          if(s.stamina < 30 && !s.warned){ s.warned = true; CH3.toast('⚠ 血流變慢了！趕快把小魚放回水盆休息'); renderOps(); }
        }
      }
      raf = requestAnimationFrame(tick);
    }
    /* ---- 介面 ---- */
    var MSG = [
      '<h3>步驟 1：準備小魚</h3><p>用小撈網把小魚撈起，放進培養皿中。</p>',
      '<h3>步驟 2：蓋上化妝棉</h3><p>沾溼的化妝棉可以<b>保濕、維持魚體呼吸</b>。把上方的 <b>☁️ 沾溼的化妝棉</b> 拖到（或點一下再點）小魚的<b>頭部與鰓蓋</b>上，<b>尾鰭要完整露出</b>。</p>',
      '<h3>步驟 3：低倍物鏡對焦</h3><p>把培養皿放上載物台，先用<b>低倍物鏡</b>觀察。轉動調節輪，直到看清楚尾鰭裡的血管。</p>',
      '',
      '<h3>步驟 4：換高倍物鏡</h3><p>想看得更清楚，要換到高倍物鏡。注意：<b>不要讓鏡頭壓到小魚的腹部</b>！</p>',
      '<h3>步驟 5：觀察血液流動</h3><p>小魚不能離開水太久，要專心觀察！右上角是小魚的體力，血流變慢就要讓牠回水盆休息。</p>'
    ];
    function render(){
      if(s.st <= 2){ flowOn = false; svg.innerHTML = dishScene(); }
      if(s.st >= 3 && !fieldG){ fieldScene(); }
      if(s.st >= 3) flowOn = true;
      stamBox.style.display = s.st === 5 ? '' : 'none';
      msg.innerHTML = s.st === 3 ? MSG[2] : MSG[s.st];
      renderOps();
    }
    function renderOps(){
      var h = '';
      if(s.st === 0) h = '<button class="btn defense" data-a="fish">🥅 撈起小魚放入培養皿</button>';
      if(s.st === 2) h = '<div class="good">👍 化妝棉蓋好了，尾鰭完整露出。</div><button class="btn defense" data-a="scope">🔬 放到顯微鏡下</button>';
      if(s.st === 3) h = '<div class="range"><label><b>調節輪</b></label><input type="range" min="0" max="100" value="'+s.focus+'" data-a="focus"></div><div data-fmsg></div>';
      if(s.st === 4) h = '<button class="btn ghost" data-a="raise" '+(s.raised?'disabled':'')+'>⬆ 先把鏡頭稍微升高</button><button class="btn defense" data-a="high">🔄 轉到高倍物鏡</button>';
      if(s.st === 5){
        h = '<div class="checklist"><b>觀察重點（看到就打勾）</b>' + ['魚鰭內有不同粗細的血管','血液有不同的流向','血液有不同的流速','血管的分支與匯流情形','血管內有快速移動的血球'].map(function(t){ return '<label><input type="checkbox">'+t+'</label>'; }).join('') + '</div>';
        h += '<button class="btn ghost" data-a="rest">🪣 把小魚放回水盆休息</button>' + (s.stamina < 30 ? '<div class="warn">⚠ 小魚血流變慢了，請先讓牠回水盆休息！</div>' : '');
      }
      ops.innerHTML = h;
      if(s.st === 5) renderTasks();
      else extra.innerHTML = '';
    }
    function renderTasks(){
      var names = { art:'甲', c2:'乙', vein:'丙' };
      var done = Object.keys(names).every(function(k){ return s.ids[k] === k; });
      var h = '<hr style="border:none;border-top:1px dashed rgba(0,0,0,.15)"><h3>任務一：判斷血管</h3><p>點畫面上的 <b>甲、乙、丙</b>，再選它是哪一種血管（看<b>血流方向、分支或匯流</b>）。</p>';
      h += '<div class="ops">' + Object.keys(names).map(function(k){
        var v = s.ids[k], c = v ? (v === k ? 'var(--c-ok)' : 'var(--c-ng)') : 'var(--c-line)';
        return '<span style="border:2px solid '+c+';border-radius:12px;padding:6px 12px;font-weight:900">'+names[k]+'：'+(v ? {art:'小動脈',c2:'微血管',vein:'小靜脈'}[v] : '？')+'</span>';
      }).join('') + '</div>';
      if(s.pick) h += '<p>你選了 <b>'+names[s.pick]+'</b>，它是：</p><div class="ops"><button class="btn ghost" data-id="art">小動脈</button><button class="btn ghost" data-id="c2">微血管</button><button class="btn ghost" data-id="vein">小靜脈</button></div>';
      if(done) h += '<div class="good">全對！<b>分支成微血管</b>的是小動脈（甲），血流最快；<b>微血管</b>（乙）最細、紅血球單列通過、流速最慢；<b>由微血管匯流而成</b>的是小靜脈（丙）。</div>';
      h += '<hr style="border:none;border-top:1px dashed rgba(0,0,0,.15)"><h3>任務二：上下顛倒、左右相反</h3><p>視野下，甲（小動脈）的血液往<b>左</b>流。複式顯微鏡的影像上下顛倒、左右相反，那實際上甲往哪邊流？</p>' +
        '<div class="ops"><button class="btn ghost" data-dir="L">⬅ 向左</button><button class="btn ghost" data-dir="R">向右 ➡</button><button class="btn ghost" data-a="flip">'+(s.flipped ? '👁 回到視野下' : '🔄 對照實際情形')+'</button></div><div data-dirmsg>'+(s.dirMsg || '')+'</div>';
      extra.innerHTML = h;
    }
    ops.addEventListener('input', function(e){
      if(e.target.getAttribute('data-a') !== 'focus') return;
      s.focus = Number(e.target.value); applyBlur();
      var fm = ops.querySelector('[data-fmsg]');
      if(Math.abs(s.focus - 62) <= 5){ fm.innerHTML = '<div class="good">對焦完成！低倍下看到尾鰭裡粗細不同的血管。</div>'; setTimeout(function(){ if(s.st === 3){ s.st = 4; render(); } }, 900); }
      else fm.innerHTML = '<p style="color:var(--c-muted)">畫面還模糊，繼續轉動調節輪。</p>';
    });
    function onClick(e){
      var b = e.target.closest('[data-a],[data-id],[data-dir]'); if(!b) return;
      var a = b.getAttribute('data-a');
      if(a === 'fish'){ s.st = 1; render(); }
      if(a === 'scope'){ s.st = 3; render(); }
      if(a === 'raise'){ s.raised = true; CH3.toast('鏡頭升高了，可以安全換高倍'); renderOps(); }
      if(a === 'high'){
        if(!s.raised){ msg.innerHTML = MSG[4] + '<div class="warn">⚠ 鏡頭太低，換高倍物鏡會<b>壓到小魚的腹部</b>！先把鏡頭稍微升高。</div>'; return; }
        s.high = true; s.st = 5; applyFlip(); render();
      }
      if(a === 'rest'){
        s.resting = true; flowOn = false; CH3.toast('小魚回到水盆休息中…');
        setTimeout(function(){ s.stamina = 100; stamBar.style.width = '100%'; s.resting = false; s.warned = false; flowOn = true; renderOps(); CH3.toast('小魚休息好了，可以繼續觀察'); }, UNIT.reduced() ? 300 : 2000);
      }
      if(a === 'flip'){ s.flipped = !s.flipped; applyFlip(); renderTasks(); }
      if(b.hasAttribute('data-id') && s.pick){ s.ids[s.pick] = b.getAttribute('data-id'); s.pick = null; renderTasks(); }
      if(b.hasAttribute('data-dir')){
        s.dirMsg = b.getAttribute('data-dir') === 'R'
          ? '<div class="good">正確！影像上下顛倒、左右相反，視野下往左流，實際是<b>向右</b>流。按「對照實際情形」看看。</div>'
          : '<div class="warn">再想想：顯微鏡影像<b>左右相反</b>，視野下往左，實際應該往哪邊？</div>';
        renderTasks();
      }
    }
    ops.addEventListener('click', onClick); extra.addEventListener('click', onClick);
    svg.addEventListener('click', function(e){
      if(s.st !== 5) return;
      var t = e.target.closest('[data-v]'); if(!t) return;
      var v = t.getAttribute('data-v'); if(v === 'c1' || v === 'c3') v = 'c2';
      s.pick = v; renderTasks();
    });
    render(); raf = requestAnimationFrame(tick);
  };
})();
