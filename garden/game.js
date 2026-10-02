// 呼吸花園 — 登入 + 每天來一次,7 格花各長一步(長大規則在雲端櫃子的 grow_today 裡,手機改不了)

const W = 390;
const H = 844;

const sb = supabase.createClient(GARDEN_CONFIG.supabaseUrl, GARDEN_CONFIG.supabaseKey);

// 7 種花(暫名,之後換麻糬的名字和圖),每種 4 個階段:種子 → 發芽 → 長葉 → 開花
const PLANTS = [
  { name: '月光鈴蘭', color: 0xf7f3ff, center: 0xffe27a, petals: 5 },
  { name: '晨曦玫瑰', color: 0xff8fa3, center: 0xffd166, petals: 6 },
  { name: '星空藍菊', color: 0x7fa8ff, center: 0xfff3b0, petals: 8 },
  { name: '暖陽向日葵', color: 0xffd23f, center: 0x8a5a2b, petals: 10 },
  { name: '薰衣草夢', color: 0xb98cf0, center: 0xf3e6ff, petals: 4 },
  { name: '蜜桃櫻', color: 0xffc2d1, center: 0xff6f91, petals: 5 },
  { name: '薄荷雛菊', color: 0xb8f2d0, center: 0xffe066, petals: 7 },
];

// 3 隻小怪獸(之後換成麻糬的美術圖):白色 Nomi、黑色 Nomu、頭頂上小小隻 Nomeow
const MONSTERS = [
  { name: 'Nomi', color: 0xfafafa },
  { name: 'Nomu', color: 0x3a3a3a },
  { name: 'Nomeow', color: 0xffd6e0 },
];

// 7 格排成 2-3-2,像一朵花
const PLOT_POS = [
  [135, 300], [255, 300],
  [75, 420], [195, 420], [315, 420],
  [135, 540], [255, 540],
];

// 台灣今天的日期,例如 2026-10-01
function taipeiToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

class GardenScene extends Phaser.Scene {
  constructor() { super('garden'); }

  create() {
    this.plots = [];

    this.add.rectangle(W / 2, H / 2, W, H, 0xf4efe6);
    this.add.rectangle(W / 2, 420, W - 20, 400, 0xdfe9d3).setStrokeStyle(3, 0xb9cfa8);
    this.add.text(W / 2, 55, '呼吸花園', { fontSize: '34px', color: '#5b4a3a', fontStyle: 'bold' }).setOrigin(0.5);
    this.tip = this.add.text(W / 2, 100, '', { fontSize: '16px', color: '#7a6a5a' }).setOrigin(0.5);

    this.add.text(W - 16, 20, '登出', { fontSize: '14px', color: '#a09080' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', async () => { await sb.auth.signOut(); location.reload(); });

    this.add.text(16, 20, '🎟️ 折扣碼', { fontSize: '14px', color: '#7a6a5a' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => openCoupons(this));

    this.status = this.add.text(W / 2, 200, '', { fontSize: '15px', color: '#7a6a5a' }).setOrigin(0.5);

    this.makeCareButton();
    PLOT_POS.forEach(([x, y], i) => this.makePlot(x, y, i));
    this.makeMonster();
    this.makeCollection();
    this.refresh();
  }

  makeCareButton() {
    this.btnBg = this.add.rectangle(W / 2, 160, 240, 52, 0x6cc070).setStrokeStyle(3, 0x4f9a55);
    this.btnText = this.add.text(W / 2, 160, '', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.btnBg.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      if (!this.btnEnabled) return;
      if (this.btnMode === 'task') openTask(this);
      else this.careToday();
    });
    this.setButton(false, '讀取中…');
  }

  setButton(enabled, label, mode = 'care') {
    this.btnEnabled = enabled;
    this.btnMode = mode;
    this.btnText.setText(label);
    this.btnBg.setFillStyle(enabled ? 0x6cc070 : 0xc9c2b8);
    this.btnBg.setStrokeStyle(3, enabled ? 0x4f9a55 : 0xb0a89e);
  }

  async refresh() {
    const [plotsRes, checkRes, walletRes, craftsRes] = await Promise.all([
      sb.from('plots').select('slot, kind, stage'),
      sb.from('checkins').select('day').eq('day', taipeiToday()),
      sb.from('wallets').select('streak, coins, last_day').maybeSingle(),
      sb.from('crafts').select('id', { count: 'exact', head: true }),
    ]);
    if (plotsRes.error || checkRes.error || walletRes.error || craftsRes.error) {
      this.tip.setText('連不上雲端,請重新整理');
      return;
    }
    this.plots.forEach(p => { p.kind = null; p.stage = -1; });
    plotsRes.data.forEach(row => {
      const p = this.plots[row.slot];
      p.kind = row.kind;
      p.stage = row.stage;
    });
    this.plots.forEach(p => this.drawPlant(p));

    const doneToday = checkRes.data.length > 0;
    this.drawStatus(walletRes.data, doneToday);
    this.drawCollection(craftsRes.count || 0);
    const allBloom = this.plots.every(p => p.stage === 3);
    if (allBloom) {
      this.setButton(true, '🌸 來做任務', 'task');
      this.tip.setText('7 朵花都開好了!');
    } else if (doneToday) {
      this.setButton(false, '今天照顧過了 ✓');
      this.tip.setText(plotsRes.data.length ? '明天再來,花會再長大一點' : '明天再來種新的花 🌱');
    } else {
      this.setButton(true, '今天來照顧花園 💧');
      this.tip.setText(plotsRes.data.length ? '花在等妳澆水' : '按下按鈕,種下 7 顆種子');
    }
  }

  // 連續天數(只當紀錄) + 金幣(之後從任務拿);昨天沒來的話,畫面上的連續天數先歸零(真正重算在雲端)
  drawStatus(wallet, doneToday) {
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const alive = wallet && (doneToday || wallet.last_day === yesterday);
    const streak = alive ? wallet.streak : 0;
    const coins = wallet ? wallet.coins : 0;
    this.coins = coins;
    this.status.setText(`🔥 連續 ${streak} 天   🪙 金幣 ${coins}`);
  }

  async careToday() {
    this.setButton(false, '澆水中…');
    const { error } = await sb.rpc('grow_today');
    if (error) {
      this.tip.setText('出了點問題,請再試一次');
      this.setButton(true, '今天來照顧花園 💧');
      return;
    }
    await this.refresh();
    this.plots.forEach(p => {
      if (p.kind !== null) this.tweens.add({ targets: p.plant, scaleX: 1.12, scaleY: 0.9, yoyo: true, duration: 160 });
    });
  }

  makePlot(x, y, i) {
    this.add.ellipse(x, y + 25, 96, 42, 0x9c7b5b).setStrokeStyle(3, 0x7a5c40);
    const plant = this.add.container(x, y);
    this.plots.push({ i, x, y, plant, kind: null, stage: -1 });
  }

  drawPlant(plot) {
    const c = plot.plant;
    c.removeAll(true);
    if (plot.kind === null) return;
    const p = PLANTS[plot.kind];
    const g = this.add.graphics();
    c.add(g);
    if (plot.stage === 0) {
      g.fillStyle(0x6b4a2b).fillEllipse(0, 22, 14, 10);
      return;
    }
    const stemH = [0, 18, 34, 46][plot.stage];
    g.lineStyle(4, 0x4f9a55).lineBetween(0, 24, 0, 24 - stemH);
    g.fillStyle(0x6cc070);
    g.fillEllipse(-9, 24 - stemH * 0.5, 16, 8);
    if (plot.stage >= 2) g.fillEllipse(9, 24 - stemH * 0.7, 16, 8);
    if (plot.stage === 3) {
      const top = 24 - stemH;
      g.fillStyle(p.color);
      for (let k = 0; k < p.petals; k++) {
        const a = (k / p.petals) * Math.PI * 2;
        g.fillCircle(Math.cos(a) * 10, top + Math.sin(a) * 10, 8);
      }
      g.fillStyle(p.center).fillCircle(0, top, 6);
    }
  }

  makeMonster() {
    // 在花園裡晃來晃去的小怪獸(先畫成圓滾滾的小團子)
    const m = this.add.container(60, 600);
    const body = this.add.circle(0, 0, 22, MONSTERS[0].color).setStrokeStyle(2, 0x5b8a6a);
    const eyeL = this.add.circle(-7, -4, 3, 0x333333);
    const eyeR = this.add.circle(7, -4, 3, 0x333333);
    m.add([body, eyeL, eyeR]);
    this.tweens.add({ targets: m, x: 330, duration: 6000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: m, y: 592, duration: 400, yoyo: true, repeat: -1 });
  }

  makeCollection() {
    this.add.rectangle(W / 2, 720, W - 30, 150, 0xffffff).setStrokeStyle(2, 0xe2d6c4);
    this.add.text(W / 2, 665, '小怪獸圖鑑', { fontSize: '18px', color: '#5b4a3a', fontStyle: 'bold' }).setOrigin(0.5);
    this.collection = MONSTERS.map((_, i) => this.add.container(95 + i * 100, 0));
    this.drawCollection(0);
  }

  // 做完幾次任務,就收集到前幾隻小怪獸(最多 3 隻)
  drawCollection(tasksDone) {
    MONSTERS.forEach((mon, i) => {
      const c = this.collection[i];
      const got = i < tasksDone;
      const eyes = mon.color === 0x3a3a3a ? 0xffffff : 0x333333;
      c.removeAll(true);
      c.add(this.add.circle(0, 718, 24, got ? mon.color : 0xdddddd).setStrokeStyle(2, got ? 0x777777 : 0xbbbbbb));
      if (got) {
        c.add(this.add.circle(-7, 714, 3, eyes));
        c.add(this.add.circle(7, 714, 3, eyes));
      } else {
        c.add(this.add.text(0, 718, '?', { fontSize: '22px', color: '#999999' }).setOrigin(0.5));
      }
      c.add(this.add.text(0, 758, got ? mon.name : '???', { fontSize: '14px', color: '#7a6a5a' }).setOrigin(0.5));
    });
  }
}

// ---------- 7 朵花開完後的任務視窗 ----------
const TASKS = [
  { kind: 'bouquet', em: '💐', name: '做成花束', done: '7 朵花綁成了一束花' },
  { kind: 'dreamcatcher', em: '🕸️', name: '做成捕夢網', done: '7 朵花編進了捕夢網' },
  { kind: 'dried', em: '🥀', name: '做成乾燥花', done: '7 朵花慢慢變成了乾燥花' },
  { kind: 'monster_photo', em: '📸', name: '讓小怪獸戴花拍照', done: '小怪獸戴上花,拍了一張照' },
  { kind: 'flower_photo', em: '📷', name: '幫花朵拍照', done: '幫 7 朵花拍了一張照' },
  { kind: 'poem', em: '✍️', name: '寫一首詩', done: '為花寫了一首詩' },
  { kind: 'bookmark', em: '🔖', name: '做成書籤', done: '7 朵花壓成了書籤' },
];

function hex(n) { return '#' + n.toString(16).padStart(6, '0'); }
function esc(s) { return s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

function flowerDots(scene) {
  return '<div class="flowers">' + scene.plots.map(p =>
    `<div class="dot" title="${PLANTS[p.kind].name}" style="background:${hex(PLANTS[p.kind].color)}"></div>`).join('') + '</div>';
}

function showTask(html) {
  document.getElementById('taskCard').innerHTML = html;
  document.getElementById('task').style.display = 'flex';
}
function closeTask() { document.getElementById('task').style.display = 'none'; }

// 第一步:選要把花做成什麼
function openTask(scene) {
  showTask(`
    <h2>7 朵花都開好了 🌸</h2>
    <p class="sub">要把它們做成什麼?</p>
    ${flowerDots(scene)}
    <div class="grid">
      ${TASKS.map((t, i) => `<button class="pick" data-i="${i}"><span class="em">${t.em}</span>${t.name}</button>`).join('')}
    </div>
    <button class="back" id="taskClose">等一下再做</button>`);
  document.querySelectorAll('#taskCard .pick').forEach(b => b.onclick = () => makeCraft(scene, TASKS[+b.dataset.i]));
  document.getElementById('taskClose').onclick = closeTask;
}

// 第二步:做作品(寫詩要打字,其他直接完成)
function makeCraft(scene, t) {
  const poemBox = t.kind === 'poem' ? '<textarea id="poem" maxlength="500" placeholder="寫下妳想對花說的話…"></textarea>' : '';
  showTask(`
    <div class="big">${t.em}</div>
    <h2>${t.name}</h2>
    ${flowerDots(scene)}
    ${poemBox}
    <button class="main" id="craftDone">完成 ✨</button>
    <button class="back" id="craftBack">換一個</button>
    <div class="err" id="craftErr"></div>`);
  document.getElementById('craftBack').onclick = () => openTask(scene);
  document.getElementById('craftDone').onclick = async () => {
    const poem = t.kind === 'poem' ? document.getElementById('poem').value.trim() : null;
    if (t.kind === 'poem' && !poem) { document.getElementById('craftErr').textContent = '先寫幾個字吧'; return; }
    document.getElementById('craftDone').disabled = true;
    const { data, error } = await sb.rpc('complete_task', { p_kind: t.kind, p_poem: poem });
    if (error) {
      document.getElementById('craftDone').disabled = false;
      document.getElementById('craftErr').textContent = '出了點問題,請再試一次';
      return;
    }
    showReward(scene, t, poem, data);
  };
}

// ---------- 金幣換占卜折扣碼:1 金幣 = 折 1 元,一張最多 70 元,只能用一次 ----------
async function openCoupons(scene) {
  const coins = scene.coins || 0;
  const { data: list } = await sb.from('coupons').select('code, amount, status').order('created_at', { ascending: false });
  const amounts = [10, 20, 30, 40, 50, 60, 70];
  const mine = (list || []).map(c => `
    <div style="display:flex;justify-content:space-between;padding:8px 4px;border-bottom:1px solid #f0e8dc;
      ${c.status === 'used' ? 'color:#b0a89e;text-decoration:line-through' : 'color:#5b4a3a'}">
      <b>${c.code}</b><span>折 ${c.amount} 元 · ${c.status === 'used' ? '已使用' : '可使用'}</span>
    </div>`).join('');
  showTask(`
    <h2>🎟️ 換占卜折扣碼</h2>
    <p class="sub">妳有 🪙 ${coins} 枚金幣<br>1 枚金幣 = 折 1 元,一張最多折 70 元</p>
    <div class="grid">
      ${amounts.map(a => `<button class="pick amt" data-a="${a}" ${a > coins ? 'disabled style="opacity:.35"' : ''}>折 ${a} 元</button>`).join('')}
    </div>
    <div class="err" id="cpErr"></div>
    ${mine ? `<p class="sub" style="margin:14px 0 4px;text-align:left"><b>我的折扣碼</b></p>${mine}` : ''}
    <button class="back" id="cpClose">回花園</button>`);
  document.querySelectorAll('#taskCard .amt').forEach(b => b.onclick = () => confirmRedeem(scene, +b.dataset.a));
  document.getElementById('cpClose').onclick = closeTask;
}

// 複製文字:新方法要 https 才能用,手機用 http 打開時改用舊方法
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

function confirmRedeem(scene, amount) {
  showTask(`
    <div class="big">🎟️</div>
    <h2>用 ${amount} 枚金幣換「折 ${amount} 元」?</h2>
    <p class="sub">換了之後金幣會扣掉,不能退回喔</p>
    <button class="main" id="cpYes">確定換</button>
    <button class="back" id="cpNo">再想想</button>
    <div class="err" id="cpErr"></div>`);
  document.getElementById('cpNo').onclick = () => openCoupons(scene);
  document.getElementById('cpYes').onclick = async () => {
    document.getElementById('cpYes').disabled = true;
    const { data, error } = await sb.rpc('redeem_coins', { p_amount: amount });
    if (error) {
      document.getElementById('cpYes').disabled = false;
      document.getElementById('cpErr').textContent =
        (error.message || '').includes('not enough') ? '金幣不夠喔' : '出了點問題,請再試一次';
      return;
    }
    showCoupon(scene, data);
  };
}

function showCoupon(scene, data) {
  showTask(`
    <div class="big">🎉</div>
    <h2>換好了!</h2>
    <p class="sub">預約占卜時,把這組折扣碼給麻糬</p>
    <div id="cpCode" style="font-size:28px;font-weight:bold;letter-spacing:2px;color:#5b4a3a;
      background:#fffaf2;border:2px dashed #e2d6c4;border-radius:12px;padding:14px;margin:6px 0">${data.code}</div>
    <p class="sub">折 ${data.amount} 元 · 只能用一次 · 剩下 🪙 ${data.coins} 枚</p>
    <button class="main" id="cpCopy">複製折扣碼</button>
    <button class="back" id="cpDone">回花園</button>`);
  document.getElementById('cpCopy').onclick = async () => {
    const btn = document.getElementById('cpCopy');
    btn.textContent = (await copyText(data.code)) ? '已複製 ✓' : '請長按上面的字複製';
  };
  document.getElementById('cpDone').onclick = () => { closeTask(); scene.refresh(); };
}

// 第三步:拿獎勵
function showReward(scene, t, poem, data) {
  const mon = data.new_monster !== null ? MONSTERS[data.new_monster] : null;
  showTask(`
    <div class="big">${t.em}</div>
    <h2>${t.done}</h2>
    ${poem ? `<p class="sub" style="white-space:pre-wrap">${esc(poem)}</p>` : ''}
    <p class="sub">🪙 拿到 10 枚金幣(現在共 ${data.coins} 枚)</p>
    ${mon ? `<p class="sub">🎁 獲得 <b>${mon.name}</b> 的電腦桌面寵物和手機桌布!</p>` : ''}
    <button class="main" id="rewardOk">回花園,明天再種新的花 🌱</button>`);
  document.getElementById('rewardOk').onclick = () => { closeTask(); scene.refresh(); };
}

let game = null;
function startGame() {
  document.getElementById('login').style.display = 'none';
  if (game) return;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#f4efe6',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: GardenScene,
  });
}

// ---------- 登入頁 ----------
const $ = id => document.getElementById(id);

function say(text, ok) {
  $('msg').style.color = ok ? '#4f9a55' : '#c0504d';
  $('msg').textContent = text;
}

function readForm() {
  const email = $('email').value.trim();
  const password = $('password').value;
  if (!email || !password) { say('請填信箱和密碼'); return null; }
  if (password.length < 6) { say('密碼至少要 6 個字'); return null; }
  return { email, password };
}

function chineseError(err) {
  const m = (err && err.message) || '';
  if (m.includes('Invalid login')) return '信箱或密碼不對';
  if (m.includes('already registered')) return '這個信箱註冊過了,直接按「登入」';
  if (m.includes('Email not confirmed')) return '信箱還沒確認,請先去收信';
  if (m.includes('valid email') || m.includes('invalid')) return '信箱格式不對';
  return '出了點問題:' + m;
}

$('btnLogin').onclick = async () => {
  const f = readForm(); if (!f) return;
  say('登入中…', true);
  const { error } = await sb.auth.signInWithPassword(f);
  if (error) return say(chineseError(error));
  startGame();
};

$('btnSignup').onclick = async () => {
  const f = readForm(); if (!f) return;
  say('註冊中…', true);
  const { data, error } = await sb.auth.signUp(f);
  if (error) return say(chineseError(error));
  if (data.session) return startGame();
  say('註冊好了!請先去信箱點確認信,再回來登入', true);
};

(async () => {
  const { data } = await sb.auth.getSession();
  if (data.session) startGame();
  else $('login').style.display = 'flex';
})();
