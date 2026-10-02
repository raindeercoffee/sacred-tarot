// 呼吸花園後台:核銷折扣碼、看玩家、看兌換紀錄。所有資料都要通過雲端的 is_admin() 檢查才拿得到

const sb = supabase.createClient(GARDEN_CONFIG.supabaseUrl, GARDEN_CONFIG.supabaseKey);
const $ = id => document.getElementById(id);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function tw(t) {
  return t ? new Date(t).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }) : '—';
}
function say(id, text, ok) {
  $(id).className = 'msg ' + (ok ? 'good' : 'bad');
  $(id).textContent = text;
}

// ---------- 登入 ----------
async function enter() {
  const { data, error } = await sb.rpc('is_admin');
  if (error || !data) {
    await sb.auth.signOut();
    $('app').style.display = 'none';
    $('loginBox').style.display = 'block';
    say('loginMsg', '這個帳號不是管理員');
    return;
  }
  $('loginBox').style.display = 'none';
  $('app').style.display = 'block';
  loadPlayers();
  loadCoupons();
}

$('btnLogin').onclick = async () => {
  const email = $('email').value.trim();
  const password = $('password').value;
  if (!email || !password) return say('loginMsg', '請填信箱和密碼');
  say('loginMsg', '登入中…', true);
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return say('loginMsg', '信箱或密碼不對');
  say('loginMsg', '', true);
  enter();
};

$('btnLogout').onclick = async () => { await sb.auth.signOut(); location.reload(); };

// ---------- 核銷折扣碼 ----------
async function lookup() {
  const code = $('code').value.trim();
  $('codeResult').innerHTML = '';
  if (!code) return say('codeMsg', '請輸入折扣碼');
  say('codeMsg', '查詢中…', true);
  const { data, error } = await sb.rpc('admin_lookup_coupon', { p_code: code });
  if (error) return say('codeMsg', '查詢失敗,請再試一次');
  if (!data) return say('codeMsg', '❌ 查無此碼,可能打錯了');
  say('codeMsg', '', true);
  const used = data.status === 'used';
  $('codeResult').innerHTML = `
    <div class="result">
      <div class="big">${esc(data.code)}</div>
      <div>折 <b>${data.amount}</b> 元 · <span class="tag ${used ? 'used' : 'unused'}">${used ? '已使用' : '可使用'}</span></div>
      <div>客人:${esc(data.email)}</div>
      <div>換碼時間:${tw(data.created_at)}</div>
      ${used ? `<div>核銷時間:${tw(data.used_at)}</div>` : ''}
      ${used ? '' : '<button class="main" id="btnUse" style="margin-top:10px">核銷(標記為已使用)</button>'}
    </div>`;
  if (!used) $('btnUse').onclick = () => useCode(data.code);
}

async function useCode(code) {
  $('btnUse').disabled = true;
  const { error } = await sb.rpc('admin_use_coupon', { p_code: code });
  if (error) {
    $('btnUse').disabled = false;
    return say('codeMsg', '核銷失敗:這組碼可能已經用過了');
  }
  await lookup();
  say('codeMsg', `✅ 已核銷,這次占卜折 ${$('codeResult').querySelector('b').textContent} 元`, true);
  loadCoupons();
  loadPlayers();
}

$('btnLookup').onclick = lookup;
$('code').addEventListener('keydown', e => { if (e.key === 'Enter') lookup(); });

// ---------- 玩家 ----------
async function loadPlayers() {
  $('players').innerHTML = '讀取中…';
  const { data, error } = await sb.rpc('admin_players');
  if (error) { $('players').innerHTML = '<span class="bad">讀取失敗</span>'; return; }
  if (!data.length) { $('players').innerHTML = '<p class="hint">還沒有玩家</p>'; return; }
  $('players').innerHTML = `<table>
    <tr><th>信箱</th><th>連續天數</th><th>最後來的日子</th><th>金幣</th><th>任務</th><th>折扣碼(已用/全部)</th><th>註冊時間</th></tr>
    ${data.map(p => `<tr>
      <td>${esc(p.email)}</td><td>🔥 ${p.streak}</td><td>${esc(p.last_day || '—')}</td>
      <td>🪙 ${p.coins}</td><td>${p.tasks_done} 次</td><td>${p.coupons_used} / ${p.coupons}</td><td>${tw(p.joined)}</td>
    </tr>`).join('')}
  </table>`;
}

// ---------- 兌換紀錄 ----------
async function loadCoupons() {
  $('coupons').innerHTML = '讀取中…';
  const { data, error } = await sb.rpc('admin_coupons');
  if (error) { $('coupons').innerHTML = '<span class="bad">讀取失敗</span>'; return; }
  if (!data.length) { $('coupons').innerHTML = '<p class="hint">還沒有人換折扣碼</p>'; return; }
  $('coupons').innerHTML = `<table>
    <tr><th>折扣碼</th><th>金額</th><th>狀態</th><th>客人</th><th>換碼時間</th><th>核銷時間</th></tr>
    ${data.map(c => `<tr>
      <td><b>${esc(c.code)}</b></td><td>${c.amount} 元</td>
      <td><span class="tag ${c.status}">${c.status === 'used' ? '已使用' : '可使用'}</span></td>
      <td>${esc(c.email)}</td><td>${tw(c.created_at)}</td><td>${tw(c.used_at)}</td>
    </tr>`).join('')}
  </table>`;
}

$('btnPlayers').onclick = loadPlayers;
$('btnCoupons').onclick = loadCoupons;

(async () => {
  const { data } = await sb.auth.getSession();
  if (data.session) enter();
  else $('loginBox').style.display = 'block';
})();
