/* =========================================================
   實驗 3-1 觀察植物體內的水分運輸
   ========================================================= */
(function(){
  'use strict';
  var RED = '#E53935';

  /* ---------- 一、觀察運輸水分的構造 ---------- */
  window.LAB_SIMS.sim31a = function(box){
    box.innerHTML =
      '<div class="anim"><div class="anim-body">' +
        '<div class="stagebox"><svg viewBox="0 0 500 400" role="img" aria-label="芹菜染色實驗"></svg></div>' +
        '<div class="info"><h3>操作步驟</h3><ol class="steps"></ol><div class="ops"></div><div class="msg"></div></div>' +
      '</div></div>';
    var svg = box.querySelector('svg'), stepsEl = box.querySelector('.steps'), ops = box.querySelector('.ops'), msg = box.querySelector('.msg');
    var STEPS = ['錐形瓶加入 100 mL 清水','加入紅色食用色素 2 滴，混合均勻','在水中切取芹菜葉柄（含葉片）約 25 cm','把芹菜放入錐形瓶，靜置 30 分鐘','觀察紅色溶液在葉片和葉柄的分布','用小刀橫切和縱切葉柄，用放大鏡觀察'];
    var s = { step:0, drops:0, inFlask:false, t:0, cut:'' };
    var PET_LEN = 250;
    function celery(x, baseY, f){
      // 葉柄 + 三條維管束 + 葉片
      var top = baseY - PET_LEN, h = '';
      h += '<g>';
      h += '<path d="M'+(x-40)+' '+(top+10)+' C'+(x-90)+' '+(top-40)+' '+(x-40)+' '+(top-90)+' '+(x)+' '+(top-30)+' C'+(x+40)+' '+(top-90)+' '+(x+90)+' '+(top-40)+' '+(x+40)+' '+(top+10)+' Z" fill="#9CCC65" stroke="#558B2F" stroke-width="2"/>';
      h += '<rect x="'+(x-11)+'" y="'+top+'" width="22" height="'+PET_LEN+'" rx="9" fill="#C5E1A5" stroke="#7CB342" stroke-width="2"/>';
      [-6,0,6].forEach(function(dx){
        h += '<line x1="'+(x+dx)+'" y1="'+baseY+'" x2="'+(x+dx)+'" y2="'+top+'" stroke="#AED581" stroke-width="2.5"/>';
        if(f > 0) h += '<line x1="'+(x+dx)+'" y1="'+baseY+'" x2="'+(x+dx)+'" y2="'+(baseY - PET_LEN*Math.min(1,f*1.15))+'" stroke="'+RED+'" stroke-width="3"/>';
      });
      // 葉脈
      var vc = f > .85 ? RED : '#7CB342', vo = f > .85 ? Math.min(1,(f-.85)/.15) : 1;
      h += '<g stroke="'+vc+'" stroke-width="2" fill="none" opacity="'+(f > .85 ? vo : .7)+'"><path d="M'+x+' '+top+' L'+(x-45)+' '+(top-45)+' M'+x+' '+top+' L'+(x+45)+' '+(top-45)+' M'+x+' '+top+' L'+x+' '+(top-55)+' M'+(x-22)+' '+(top-22)+' l-18 4 M'+(x+22)+' '+(top-22)+' l18 4"/></g>';
      h += '</g>';
      return h;
    }
    function draw(){
      var h = '<rect width="500" height="400" fill="#FBFBF7"/><rect y="372" width="500" height="28" fill="#EFEBE9"/>';
      // 錐形瓶
      var water = s.step >= 1 || s.step > 0 ? 1 : 0;
      var col = s.drops >= 2 ? '#EF5350' : s.drops === 1 ? '#F48FB1' : '#B3E5FC';
      h += '<path d="M118 150 V210 L50 360 Q46 372 60 372 H240 Q254 372 250 360 L182 210 V150 Z" fill="#fff" stroke="#78909C" stroke-width="4"/>';
      if(s.step >= 1) h += '<path d="M86 290 L214 290 L250 360 Q254 372 240 372 H60 Q46 372 50 360 Z" fill="'+col+'" opacity=".85"/>';
      h += '<text x="150" y="398" text-anchor="middle" font-size="13" font-weight="700" fill="#546E7A">250 mL 錐形瓶</text>';
      // 芹菜
      if(s.inFlask) h += celery(150, 360, s.t / 30);
      else h += celery(390, 360, 0) + '<text x="390" y="395" text-anchor="middle" font-size="13" font-weight="700" fill="#558B2F">芹菜</text>';
      // 氣泡
      if(s.cut === 'air') h += '<g fill="#fff" stroke="#29B6F6" stroke-width="2"><circle cx="384" cy="340" r="5"/><circle cx="392" cy="322" r="4"/><circle cx="388" cy="300" r="3.5"/><circle cx="396" cy="352" r="4"/></g><text x="410" y="330" font-size="14" font-weight="900" fill="#0277BD">氣泡！</text>';
      // 放大鏡
      if(s.zoom){
        h += '<circle cx="370" cy="190" r="118" fill="#fff" stroke="#455A64" stroke-width="8"/><line x1="452" y1="276" x2="490" y2="320" stroke="#455A64" stroke-width="14" stroke-linecap="round"/>';
        h += '<line x1="160" y1="230" x2="255" y2="190" stroke="#90A4AE" stroke-width="2" stroke-dasharray="5 4"/>';
        if(s.zoom === 'x'){
          h += '<path d="M290 160 C290 110 450 110 450 160 C450 230 400 270 370 270 C340 270 290 230 290 160 Z M318 168 C330 140 410 140 422 168 C410 200 330 200 318 168Z" fill="#DCEDC8" stroke="#7CB342" stroke-width="2" fill-rule="evenodd"/>';
          [[300,165],[312,205],[338,238],[370,252],[402,238],[428,205],[440,165],[350,128],[390,128]].forEach(function(p){
            var dx = 370 - p[0], dy = 180 - p[1], d = Math.hypot(dx,dy), ux = dx/d, uy = dy/d;
            h += '<circle cx="'+(p[0]-ux*3)+'" cy="'+(p[1]-uy*3)+'" r="6" fill="#FFF59D" stroke="#C0CA33"/>';
            h += '<circle cx="'+(p[0]+ux*7)+'" cy="'+(p[1]+uy*7)+'" r="6.5" fill="'+RED+'"/>';
          });
          h += '<text x="370" y="296" text-anchor="middle" font-size="15" font-weight="900" fill="#C62828">橫切面：紅點＝木質部</text>';
        } else {
          h += '<rect x="300" y="90" width="140" height="190" rx="12" fill="#DCEDC8" stroke="#7CB342" stroke-width="2"/>';
          [320,350,380,410].forEach(function(x){ h += '<rect x="'+(x-4)+'" y="90" width="8" height="190" fill="'+RED+'" opacity=".85"/><rect x="'+(x+5)+'" y="90" width="4" height="190" fill="#FFF59D"/>'; });
          h += '<text x="370" y="296" text-anchor="middle" font-size="15" font-weight="900" fill="#C62828">縱切面：紅色長條＝木質部</text>';
        }
      }
      if(s.inFlask && s.step >= 4) h += '<g transform="translate(250 30)"><rect x="-50" y="-18" width="100" height="32" rx="16" fill="#263238"/><text y="4" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">⏱ '+Math.round(s.t)+' 分鐘</text></g>';
      svg.innerHTML = h;
      stepsEl.innerHTML = STEPS.map(function(t,i){ return '<li class="'+(i < s.step ? 'on' : '')+'">'+(i < s.step ? '✅ ' : '')+t+'</li>'; }).join('');
      renderOps();
    }
    function renderOps(){
      var h = '';
      if(s.step === 0) h = '<button class="btn plant" data-a="water">💧 倒入 100 mL 清水</button>';
      if(s.step === 1) h = '<button class="btn plant" data-a="drop">🔴 滴入紅色色素（'+s.drops+'／2）</button>';
      if(s.step === 2) h = '<button class="btn plant" data-a="cutwater">🪣 在水中切取</button><button class="btn ghost" data-a="cutair">🔪 在空氣中切取</button>';
      if(s.step === 3) h = '<button class="btn plant" data-a="put">⚗️ 把芹菜放入錐形瓶</button>';
      if(s.step === 4) h = '<div class="range"><label><b>靜置時間</b></label><input type="range" min="0" max="30" step="1" value="'+s.t+'" data-a="time"><button class="btn ghost" data-a="ff">⏩ 快轉</button></div>';
      if(s.step >= 5) h = '<button class="btn plant" data-a="x">🔪 橫切葉柄</button><button class="btn plant" data-a="y">🔪 縱切葉柄</button>' + (s.step >= 6 ? '<button class="btn ghost" data-a="reset">↺ 重做</button>' : '');
      ops.innerHTML = h;
    }
    var ff = null;
    function setTime(v){
      s.t = v; draw();
      if(v >= 30){ s.step = 5; msg.innerHTML = '<div class="good">30 分鐘到了！看看葉柄和葉脈：紅色溶液沿著葉柄上升，連葉脈都變紅了。接著把葉柄切開觀察。</div>'; draw(); }
    }
    ops.addEventListener('input', function(e){ if(e.target.getAttribute('data-a') === 'time'){ s.t = Number(e.target.value); setTime(s.t); } });
    ops.addEventListener('click', function(e){
      var b = e.target.closest('[data-a]'); if(!b) return;
      var a = b.getAttribute('data-a');
      if(a === 'water'){ s.step = 1; msg.innerHTML = ''; }
      if(a === 'drop'){ s.drops++; if(s.drops >= 2){ s.step = 2; msg.innerHTML = '<div class="good">溶液變成紅色了。為什麼不用清水？因為水是透明的，<b>染色後才看得到水分經過的通道</b>。</div>'; } }
      if(a === 'cutair'){ s.cut = 'air'; msg.innerHTML = '<div class="warn">⚠ 在空氣中切取，空氣會從切口進入維管束形成<b>氣泡</b>，阻塞水分運輸！請改成「在水中切取」。</div>'; }
      if(a === 'cutwater'){ s.cut = 'water'; s.step = 3; msg.innerHTML = '<div class="good">👍 在水盆中切取約 25 cm 的葉柄（含葉片），切口不會進入空氣。</div>'; }
      if(a === 'put'){ s.inFlask = true; s.cut = ''; s.step = 4; msg.innerHTML = '<p>拖曳「靜置時間」滑桿或按「快轉」，觀察 30 分鐘內的變化。</p>'; }
      if(a === 'ff'){ clearInterval(ff); ff = setInterval(function(){ if(s.t >= 30){ clearInterval(ff); return; } setTime(s.t + 1); }, UNIT.reduced() ? 30 : 120); return; }
      if(a === 'x' || a === 'y'){ s.zoom = a; s.step = 6; msg.innerHTML = a === 'x'
          ? '<div class="good">橫切面上排成一圈的<b>紅點</b>就是被染紅的<b>木質部</b>（在維管束的內側）。</div>'
          : '<div class="good">縱切面上看到一條條<b>紅色長條</b>，是由下往上運水的<b>木質部</b>。</div>'; }
      if(a === 'reset'){ s = { step:0, drops:0, inFlask:false, t:0, cut:'' }; msg.innerHTML = ''; }
      draw();
    });
    draw();
  };

  /* ---------- 二、葉片有無對蒸散作用的影響 ---------- */
  window.LAB_SIMS.sim31b = function(box){
    box.innerHTML =
      '<div class="anim"><div class="bar"><div class="seg" data-place><button data-v="sun" aria-pressed="true">☀️ 通風且有日照</button><button data-v="in">🏠 室內</button></div></div><div class="anim-body">' +
        '<div class="stagebox"><svg viewBox="0 0 500 420" role="img" aria-label="甲乙量筒蒸散實驗"></svg></div>' +
        '<div class="info"><h3>操作步驟</h3><div class="ops"></div><div class="msg"></div>' +
        '<table class="datatable"><tr><th></th><th>甲（有葉片）</th><th>乙（摘除葉片）</th></tr>' +
        '<tr><td>開始刻度</td><td>10.0</td><td>10.0</td></tr>' +
        '<tr><td>30 分鐘後刻度</td><td><input inputmode="decimal" data-r="a"></td><td><input inputmode="decimal" data-r="b"></td></tr>' +
        '<tr><td>下降刻度</td><td data-d="a">—</td><td data-d="b">—</td></tr></table>' +
        '<div class="ops"><button class="btn ghost" data-chk>✔ 檢查我的紀錄</button></div><div class="msg2"></div></div>' +
      '</div></div>';
    var svg = box.querySelector('svg'), ops = box.querySelector('.ops'), msg = box.querySelector('.msg'), msg2 = box.querySelector('.msg2');
    var s = { set:false, pluck:false, place:'sun', t:0 };
    var DROP = { sun:{a:1.6,b:0.2}, in:{a:0.7,b:0.1} };
    function level(k){ return s.set ? 10 - DROP[s.place][k] * s.t / 30 : 9.4; }
    function ymL(v){ return 360 - v * 26; }  // 0 mL → 360，10 mL → 100
    function cyl(x, label, k, leaves){
      var h = '<rect x="'+(x-30)+'" y="70" width="60" height="294" rx="6" fill="#fff" stroke="#78909C" stroke-width="3"/>';
      h += '<rect x="'+(x-50)+'" y="364" width="100" height="12" rx="4" fill="#90A4AE"/>';
      var lv = level(k);
      h += '<rect x="'+(x-27)+'" y="'+ymL(lv)+'" width="54" height="'+(362-ymL(lv))+'" fill="#B3E5FC"/>';
      for(var v=0; v<=10; v+=0.5){ var y = ymL(v); h += '<line x1="'+(x-30)+'" y1="'+y+'" x2="'+(x-30+(v%1===0?16:9))+'" y2="'+y+'" stroke="#455A64" stroke-width="1.5"/>'; if(v%1===0 && v>=6) h += '<text x="'+(x-38)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" fill="#455A64">'+v+'</text>'; }
      // 芹菜
      h += '<rect x="'+(x+2)+'" y="20" width="12" height="320" rx="5" fill="#AED581" stroke="#7CB342"/>';
      if(leaves) h += '<path d="M'+(x+8)+' 30 C'+(x-50)+' -10 '+(x-30)+' 60 '+(x+8)+' 40 C'+(x+50)+' 60 '+(x+70)+' -10 '+(x+8)+' 30Z" fill="#9CCC65" stroke="#558B2F" stroke-width="2"/>';
      else h += '<text x="'+(x+40)+'" y="36" font-size="12" font-weight="700" fill="#C62828">葉片已摘除</text>';
      h += '<rect x="'+(x-34)+'" y="250" width="68" height="14" fill="#FFF59D" opacity=".7"/><text x="'+x+'" y="261" text-anchor="middle" font-size="10" fill="#827717">膠帶</text>';
      h += '<text x="'+x+'" y="404" text-anchor="middle" font-size="18" font-weight="900" fill="#37474F">'+label+'</text>';
      if(s.set) h += '<line x1="'+(x-36)+'" y1="'+ymL(10)+'" x2="'+(x+36)+'" y2="'+ymL(10)+'" stroke="#E53935" stroke-dasharray="4 3"/><text x="'+(x+34)+'" y="'+(ymL(10)-4)+'" font-size="10" fill="#E53935">起始</text>';
      return h;
    }
    function draw(){
      var h = '<rect width="500" height="420" fill="'+(s.place === 'sun' ? '#FFFDE7' : '#ECEFF1')+'"/>';
      h += s.place === 'sun' ? '<circle cx="460" cy="40" r="20" fill="#FFCA28"/><text x="420" y="90" font-size="20">🌬️</text>' : '<text x="440" y="50" font-size="26">🏠</text>';
      h += cyl(150, '甲', 'a', true) + cyl(340, '乙', 'b', !s.pluck);
      if(s.set) h += '<g transform="translate(250 20)"><rect x="-48" y="-14" width="96" height="28" rx="14" fill="#263238"/><text y="5" text-anchor="middle" font-size="14" font-weight="900" fill="#fff">⏱ '+Math.round(s.t)+' 分鐘</text></g>';
      svg.innerHTML = h;
      var o = '';
      o += '<button class="btn plant" data-a="set" '+(s.set?'disabled':'')+'>💧 用滴管把液面調到刻度 10</button>';
      o += '<button class="btn plant" data-a="pluck" '+(s.pluck||!s.set?'disabled':'')+'>✂️ 摘除乙的所有葉片</button>';
      o += '<div class="range"><label><b>靜置時間</b></label><input type="range" min="0" max="30" value="'+s.t+'" data-a="time" '+(s.set&&s.pluck?'':'disabled')+'><button class="btn ghost" data-a="ff" '+(s.set&&s.pluck?'':'disabled')+'>⏩ 快轉</button></div>';
      ops.innerHTML = o;
    }
    var ff = null;
    ops.addEventListener('click', function(e){
      var b = e.target.closest('[data-a]'); if(!b) return; var a = b.getAttribute('data-a');
      if(a === 'set'){ s.set = true; msg.innerHTML = '<p>兩支量筒都插入粗細相近的芹菜，液面調到 10。下一步：摘除乙的葉片。</p>'; }
      if(a === 'pluck'){ s.pluck = true; msg.innerHTML = '<p>甲是<b>對照組</b>（有葉片）、乙是<b>實驗組</b>（沒有葉片）。可以先選擇放置地點，再開始計時。</p>'; }
      if(a === 'ff'){ clearInterval(ff); ff = setInterval(function(){ if(s.t >= 30){ clearInterval(ff); done(); return; } s.t++; draw(); }, UNIT.reduced() ? 30 : 100); return; }
      draw();
    });
    ops.addEventListener('input', function(e){ if(e.target.getAttribute('data-a') === 'time'){ s.t = Number(e.target.value); draw(); if(s.t >= 30) done(); } });
    function done(){ msg.innerHTML = '<div class="good">30 分鐘到了！請讀出兩支量筒的刻度，填入表格（讀到小數點後一位）。</div>'; }
    UNIT.seg(box.querySelector('[data-place]'), function(v){ s.place = v; if(s.t > 0){ s.t = 0; CH3.toast('換了地點，重新計時'); } draw(); });
    box.querySelector('[data-chk]').addEventListener('click', function(){
      if(s.t < 30){ msg2.innerHTML = '<div class="warn">先完成 30 分鐘的靜置，再記錄刻度。</div>'; return; }
      var ta = level('a'), tb = level('b'), ok = true;
      ['a','b'].forEach(function(k){
        var inp = box.querySelector('[data-r="'+k+'"]'), v = parseFloat(inp.value), tr = k === 'a' ? ta : tb;
        var good = !isNaN(v) && Math.abs(v - tr) <= 0.15;
        inp.style.borderColor = good ? 'var(--c-ok)' : 'var(--c-ng)';
        box.querySelector('[data-d="'+k+'"]').textContent = isNaN(v) ? '—' : (10 - v).toFixed(1);
        if(!good) ok = false;
      });
      msg2.innerHTML = ok
        ? '<div class="good">紀錄正確！甲下降 '+(10-ta).toFixed(1)+'、乙下降 '+(10-tb).toFixed(1)+'。<b>有葉片的甲下降較多</b> → 葉片上的氣孔讓水分蒸散。'+(s.place==='sun'?'試試改放「室內」，比較看看。':'放在室內，兩支都下降得比較少。')+'</div>'
        : '<div class="warn">再仔細看一次刻度（每一小格是 0.5 mL，液面要看凹面的最低處）。正確刻度：甲約 '+ta.toFixed(1)+'、乙約 '+tb.toFixed(1)+'。</div>';
    });
    draw();
  };

  /* ---------- 延伸探討：花瓣的維管束 ---------- */
  window.LAB_SIMS.sim31c = function(box){
    box.innerHTML =
      '<div class="anim"><div class="bar"><div class="seg" data-mode><button data-v="one" aria-pressed="true">白玫瑰＋紅色溶液</button><button data-v="two">莖縱切成兩半：紅＋藍</button></div><span class="sp"></span>' +
      '<div class="range"><label><b>靜置時間</b></label><input type="range" min="0" max="100" value="0" data-t></div></div>' +
      '<div class="anim-body"><div class="stagebox"><svg viewBox="0 0 500 380" role="img" aria-label="白玫瑰染色"></svg></div>' +
      '<div class="info"><h3>延伸探討</h3><p>同學 A：「我覺得花瓣裡面應該也會有維管束吧？」</p><p>把未盛開的<b>白色玫瑰</b>放進加了色素的水中，靜置一段時間後觀察花瓣。</p><div class="msg"></div></div></div></div>';
    var svg = box.querySelector('svg'), mode = 'one', t = 0, msg = box.querySelector('.msg');
    function mix(c1, c2, k){ var a = parseInt(c1.slice(1),16), b = parseInt(c2.slice(1),16);
      var r = Math.round(((a>>16)&255)*(1-k) + ((b>>16)&255)*k), g = Math.round(((a>>8)&255)*(1-k) + ((b>>8)&255)*k), bl = Math.round((a&255)*(1-k) + (b&255)*k);
      return 'rgb('+r+','+g+','+bl+')'; }
    function draw(){
      var k = t / 100, h = '<rect width="500" height="380" fill="#FBFBF7"/>';
      var cL = mix('#FFFFFF', '#EF9A9A', k), cR = mix('#FFFFFF', mode === 'two' ? '#90CAF9' : '#EF9A9A', k);
      // 試管
      if(mode === 'one') h += '<rect x="220" y="230" width="60" height="140" rx="20" fill="#FFCDD2" stroke="#78909C" stroke-width="3"/>';
      else h += '<rect x="170" y="230" width="60" height="140" rx="20" fill="#FFCDD2" stroke="#78909C" stroke-width="3"/><rect x="270" y="230" width="60" height="140" rx="20" fill="#BBDEFB" stroke="#78909C" stroke-width="3"/>';
      // 莖
      if(mode === 'one') h += '<rect x="245" y="120" width="10" height="230" fill="#7CB342"/>';
      else h += '<path d="M245 120 V200 L200 260 V350" stroke="#7CB342" stroke-width="8" fill="none"/><path d="M255 120 V200 L300 260 V350" stroke="#7CB342" stroke-width="8" fill="none"/>';
      // 花
      for(var i=0;i<8;i++){
        var a = i / 8 * Math.PI * 2, x = 250 + Math.cos(a) * 34, y = 90 + Math.sin(a) * 30, left = Math.cos(a) < 0;
        h += '<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="34" ry="24" transform="rotate('+(a*180/Math.PI).toFixed(0)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="'+(left ? cL : cR)+'" stroke="#E0E0E0"/>';
      }
      h += '<circle cx="250" cy="90" r="22" fill="'+mix('#FFFFFF', mode === 'two' ? '#CE93D8' : '#EF9A9A', k)+'" stroke="#E0E0E0"/>';
      if(k > .6){ h += '<g stroke="'+(mode==='two'?'#1E88E5':'#E53935')+'" stroke-width="1.5" opacity=".6"><path d="M280 95 l30 -10 M280 100 l32 6 M282 90 l24 -22"/></g>'; }
      svg.innerHTML = h;
      msg.innerHTML = k > .8 ? '<div class="good">' + (mode === 'one' ? '花瓣變紅了！用放大鏡看染色的花瓣，可以看到一條條染色的<b>維管束</b>。' : '花瓣變成<b>一半紅、一半藍</b>！表示莖左右兩邊的維管束分別把水運到不同的花瓣。') + '</div>' : '';
    }
    box.querySelector('[data-t]').addEventListener('input', function(){ t = Number(this.value); draw(); });
    UNIT.seg(box.querySelector('[data-mode]'), function(v){ mode = v; draw(); });
    draw();
  };
})();
