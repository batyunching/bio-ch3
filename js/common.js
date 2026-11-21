/* =========================================================
   第3章 生物體內的運輸 — 共用程式
   每個頁面：<body data-page="home" data-root="./"> （games/ 內的頁面 data-root="../"）
   ========================================================= */
(function(){
  'use strict';

  /* ---------- 設定 ---------- */
  // 第2章網站的位置
  var CH2_URL = 'https://batyunching.github.io/bio-ch2/#/';

  // 概念卡清單（首頁進度條用；第2階段單元頁的「我懂了 ✓」使用相同 id）
  var CONCEPT_CARDS = {
    '3-1': ['3-1-c1','3-1-c2','3-1-c3','3-1-c4','3-1-c5'],
    '3-2': ['3-2-c1','3-2-c2','3-2-c3','3-2-c4','3-2-c5','3-2-c6'],
    '3-3': ['3-3-c1','3-3-c2','3-3-c3','3-3-c4']
  };

  /* ---------- localStorage（全部包 try/catch） ---------- */
  var PREFIX = 'ch3.';
  var store = {
    get: function(key, fallback){
      try{ var v = localStorage.getItem(PREFIX + key); return v === null ? fallback : JSON.parse(v); }
      catch(e){ return fallback; }
    },
    set: function(key, val){
      try{ localStorage.setItem(PREFIX + key, JSON.stringify(val)); return true; }
      catch(e){ return false; }
    },
    remove: function(key){ try{ localStorage.removeItem(PREFIX + key); }catch(e){} }
  };

  /* ---------- 學習進度 ---------- */
  var progress = {
    done: function(){ return store.get('understood', []); },
    mark: function(id, on){
      var list = progress.done().filter(function(x){ return x !== id; });
      if(on !== false) list.push(id);
      store.set('understood', list);
    },
    isDone: function(id){ return progress.done().indexOf(id) >= 0; },
    unit: function(u){
      var all = CONCEPT_CARDS[u] || [], d = progress.done();
      var n = all.filter(function(id){ return d.indexOf(id) >= 0; }).length;
      return { done:n, total:all.length };
    },
    total: function(){
      var t = 0, n = 0;
      Object.keys(CONCEPT_CARDS).forEach(function(u){ var p = progress.unit(u); t += p.total; n += p.done; });
      return { done:n, total:t };
    }
  };

  /* ---------- 錯題本 ---------- */
  var wrongBook = {
    list: function(){ return store.get('wrongbook', []); },
    add: function(id){ var l = wrongBook.list(); if(l.indexOf(id) < 0){ l.push(id); store.set('wrongbook', l); } },
    remove: function(id){ store.set('wrongbook', wrongBook.list().filter(function(x){ return x !== id; })); },
    clear: function(){ store.set('wrongbook', []); }
  };

  /* ---------- 學習概念（老師熱圖用；依題庫 tags 對應） ---------- */
  var CONCEPTS = [
    { id:'3-1-vb',   unit:'3-1', t:'維管束構造',     tags:['維管束'] },
    { id:'3-1-arr',  unit:'3-1', t:'維管束排列',     tags:['維管束排列'] },
    { id:'3-1-ring', unit:'3-1', t:'樹皮與年輪',     tags:['樹皮與年輪'] },
    { id:'3-1-water',unit:'3-1', t:'水分運輸與蒸散', tags:['水分運輸'] },
    { id:'3-1-food', unit:'3-1', t:'養分運輸',       tags:['養分運輸'] },
    { id:'3-1-lab',  unit:'3-1', t:'實驗3-1',        tags:['實驗3-1'] },
    { id:'3-2-heart',unit:'3-2', t:'心臟',           tags:['心臟'] },
    { id:'3-2-vessel',unit:'3-2',t:'血管',           tags:['血管'] },
    { id:'3-2-blood',unit:'3-2', t:'血液',           tags:['血液'] },
    { id:'3-2-circ', unit:'3-2', t:'血液循環',       tags:['血液循環'] },
    { id:'3-2-lymph',unit:'3-2', t:'淋巴系統',       tags:['淋巴系統'] },
    { id:'3-2-lab2', unit:'3-2', t:'實驗3-2 脈搏',   tags:['實驗3-2'] },
    { id:'3-2-lab3', unit:'3-2', t:'實驗3-3 魚尾鰭', tags:['實驗3-3'] },
    { id:'3-3-def',  unit:'3-3', t:'三道防線',       tags:['三道防線'] },
    { id:'3-3-vac',  unit:'3-3', t:'疫苗與免疫',     tags:['疫苗'] },
    { id:'3-3-hist', unit:'3-3', t:'科學漫遊',       tags:['科學漫遊'] }
  ];
  function conceptOf(q){
    var tags = (q && q.tags) || [];
    for(var i = 0; i < tags.length; i++){
      for(var j = 0; j < CONCEPTS.length; j++){
        if(CONCEPTS[j].unit === q.unit && CONCEPTS[j].tags.indexOf(tags[i]) >= 0) return CONCEPTS[j].id;
      }
    }
    return q && q.unit ? q.unit + '-misc' : 'misc';
  }
  /* 作答紀錄：概念精熟度（mastery）＋每題統計（qstat）＋最近作答明細（answers），會同步到雲端給老師看 */
  function record(q, ok, pick, src){
    if(!q || !q.id) return;
    var c = conceptOf(q);
    var m = store.get('mastery', {}), r = m[c] || { n:0, ok:0 };
    r.n++; if(ok) r.ok++; m[c] = r; store.set('mastery', m);
    var qs = store.get('qstat', {}), x = qs[q.id] || { n:0, ok:0 };
    x.n++; if(ok) x.ok++; x.last = ok ? 1 : 0; qs[q.id] = x; store.set('qstat', qs);
    var a = store.get('answers', []);
    a.push({ q:q.id, ok:ok ? 1 : 0, p:(pick == null ? '' : pick), s:src || '', t:Date.now() });
    if(a.length > 400) a = a.slice(a.length - 400);
    store.set('answers', a);
  }

  /* ---------- 吉祥物（原創 SVG） ---------- */
  var mascots = {
    // 小水滴
    drop: function(size){
      size = size || 64;
      return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" aria-hidden="true">' +
        '<path d="M32 4 C32 4 10 30 10 42 a22 22 0 0 0 44 0 C54 30 32 4 32 4z" fill="#29B6F6" stroke="#0288D1" stroke-width="2"/>' +
        '<ellipse cx="22" cy="34" rx="4" ry="7" fill="#fff" opacity=".55"/>' +
        '<circle cx="25" cy="42" r="3.2" fill="#1B2A3A"/><circle cx="39" cy="42" r="3.2" fill="#1B2A3A"/>' +
        '<circle cx="26" cy="41" r="1" fill="#fff"/><circle cx="40" cy="41" r="1" fill="#fff"/>' +
        '<path d="M27 50 q5 4 10 0" stroke="#1B2A3A" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<circle cx="19" cy="48" r="3" fill="#FF8A80" opacity=".6"/><circle cx="45" cy="48" r="3" fill="#FF8A80" opacity=".6"/>' +
        '</svg>';
    },
    // 紅血球快遞員（雙凹圓盤＋快遞帽）
    rbc: function(size){
      size = size || 64;
      return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" aria-hidden="true">' +
        '<ellipse cx="32" cy="38" rx="26" ry="20" fill="#E53935" stroke="#B71C1C" stroke-width="2"/>' +
        '<ellipse cx="32" cy="38" rx="12" ry="8" fill="#C62828" opacity=".55"/>' +
        '<path d="M14 22 q18 -16 36 0 z" fill="#FFB300" stroke="#E65100" stroke-width="2"/>' +
        '<rect x="44" y="19" width="12" height="4" rx="2" fill="#E65100"/>' +
        '<circle cx="24" cy="36" r="3" fill="#fff"/><circle cx="40" cy="36" r="3" fill="#fff"/>' +
        '<circle cx="24.5" cy="36.5" r="1.6" fill="#1B2A3A"/><circle cx="40.5" cy="36.5" r="1.6" fill="#1B2A3A"/>' +
        '<path d="M27 46 q5 4 10 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '</svg>';
    },
    // 白血球守衛（圓球形＋有核＋盾牌）
    wbc: function(size){
      size = size || 64;
      return '<svg viewBox="0 0 64 64" width="'+size+'" height="'+size+'" aria-hidden="true">' +
        '<circle cx="30" cy="34" r="24" fill="#F5F7FF" stroke="#1E88E5" stroke-width="2.5"/>' +
        '<path d="M20 22 q8 -6 16 0 q6 6 0 10 q-8 4 -16 0 q-6 -4 0 -10z" fill="#B39DDB" opacity=".75"/>' +
        '<circle cx="23" cy="38" r="3" fill="#1B2A3A"/><circle cx="37" cy="38" r="3" fill="#1B2A3A"/>' +
        '<path d="M25 46 q5 3 10 0" stroke="#1B2A3A" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path d="M48 34 l10 -4 l0 10 q0 8 -10 12 q-10 -4 -10 -12 l0 -10z" fill="#1E88E5" stroke="#0D47A1" stroke-width="1.5"/>' +
        '<path d="M48 38 v10 M43 43 h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' +
        '</svg>';
    },
    // 網站 logo：維管束切面意象
    logo: function(){
      return '<svg viewBox="0 0 40 40" aria-hidden="true">' +
        '<circle cx="20" cy="20" r="18" fill="#E8F5E9" stroke="#4CAF50" stroke-width="2"/>' +
        '<g fill="#29B6F6"><circle cx="20" cy="9" r="3"/><circle cx="31" cy="20" r="3"/><circle cx="20" cy="31" r="3"/><circle cx="9" cy="20" r="3"/></g>' +
        '<g fill="#FF9800"><circle cx="20" cy="5" r="1.7"/><circle cx="35" cy="20" r="1.7"/><circle cx="20" cy="35" r="1.7"/><circle cx="5" cy="20" r="1.7"/></g>' +
        '<path d="M20 15 c-4 4 -4 6 0 10 c4 -4 4 -6 0 -10z" fill="#E53935"/>' +
        '</svg>';
    }
  };

  /* ---------- 導覽列 ---------- */
  var NAV = [
    { page:'home',    href:'index.html',       label:'首頁' },
    { page:'3-1',     href:'unit3-1.html',     label:'3-1 植物運輸', unit:'3-1' },
    { page:'3-2',     href:'unit3-2.html',     label:'3-2 人體循環', unit:'3-2' },
    { page:'3-3',     href:'unit3-3.html',     label:'3-3 人體防禦', unit:'3-3' },
    { page:'lab',     href:'lab.html',         label:'實驗' },
    { page:'quiz',    href:'quiz.html',        label:'練習' },
    { page:'mindmap', href:'mindmap.html',     label:'心智圖' },
    { page:'games',   href:'games/index.html', label:'遊戲' }
  ];

  function buildNav(){
    var body = document.body;
    var root = body.getAttribute('data-root') || './';
    var current = body.getAttribute('data-page') || '';
    var nav = document.createElement('nav');
    nav.className = 'topnav';
    nav.setAttribute('aria-label', '主選單');
    var links = NAV.map(function(n){
      return '<a href="'+root+n.href+'"'+(n.unit?' data-unit="'+n.unit+'"':'')+(n.page===current?' class="active" aria-current="page"':'')+'>'+n.label+'</a>';
    }).join('');
    nav.innerHTML =
      '<a class="brand" href="'+root+'index.html">'+mascots.logo()+'<span>第3章 生物體內的運輸</span></a>' +
      '<button class="icon-btn hamburger" aria-label="開啟選單" aria-expanded="false">☰</button>' +
      '<div class="links">'+links+'</div>' +
      '<div class="tools">' +
        '<button class="icon-btn" id="btnProjector" title="投影模式（字體放大 1.3 倍）" aria-pressed="false">📽</button>' +
        '<button class="icon-btn" id="btnMotion" title="減少動態" aria-pressed="false">🐢</button>' +
      '</div>';
    body.insertBefore(nav, body.firstChild);

    var ham = nav.querySelector('.hamburger');
    ham.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      ham.textContent = open ? '✕' : '☰';
    });

    var bp = nav.querySelector('#btnProjector'), bm = nav.querySelector('#btnMotion');
    function sync(){
      bp.setAttribute('aria-pressed', document.documentElement.classList.contains('projector'));
      bm.setAttribute('aria-pressed', document.documentElement.classList.contains('reduce-motion'));
    }
    bp.addEventListener('click', function(){
      var on = document.documentElement.classList.toggle('projector');
      store.set('projector', on); sync();
      toast(on ? '投影模式：已開啟（字體放大）' : '投影模式：已關閉');
    });
    bm.addEventListener('click', function(){
      var on = document.documentElement.classList.toggle('reduce-motion');
      store.set('reduceMotion', on); sync();
      toast(on ? '已減少動態效果' : '已恢復動態效果');
    });
    sync();
    // 老師帳號：導覽列多一個「老師專區」
    if(window.BIO_ACCOUNT && BIO_ACCOUNT.ready) BIO_ACCOUNT.ready.then(function(){
      if(!BIO_ACCOUNT.isTeacher) return;
      var a = document.createElement('a'); a.href = root + 'teacher.html'; a.textContent = '👩‍🏫 老師專區';
      if(current === 'teacher'){ a.className = 'active'; a.setAttribute('aria-current', 'page'); }
      nav.querySelector('.links').appendChild(a);
    }, function(){});
  }

  // 盡早套用顯示設定，避免閃爍
  if(store.get('projector', false)) document.documentElement.classList.add('projector');
  if(store.get('reduceMotion', false)) document.documentElement.classList.add('reduce-motion');

  /* ---------- 小工具 ---------- */
  var toastTimer;
  function toast(msg){
    var t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2200);
  }
  function shuffle(arr){
    var a = arr.slice();
    for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function unitClass(u){ return 'unit-' + String(u).replace('-', ''); }
  var UNIT_NAMES = { '3-1':'植物的運輸構造', '3-2':'人體的循環', '3-3':'人體的防禦' };

  document.addEventListener('DOMContentLoaded', buildNav);

  window.CH3 = {
    CH2_URL: CH2_URL, CONCEPT_CARDS: CONCEPT_CARDS, UNIT_NAMES: UNIT_NAMES,
    store: store, progress: progress, wrongBook: wrongBook, mascots: mascots,
    toast: toast, shuffle: shuffle, unitClass: unitClass,
    CONCEPTS: CONCEPTS, conceptOf: conceptOf, record: record
  };
})();
