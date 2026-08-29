const MAJOR = [
  {n:'0',    zh:'愚者',        en:'The Fool',        sym:'🌬️'},
  {n:'I',    zh:'魔法師',      en:'The Magus',        sym:'☿'},
  {n:'II',   zh:'女祭司',      en:'The Priestess',    sym:'🌙'},
  {n:'III',  zh:'女皇',        en:'The Empress',      sym:'♀'},
  {n:'IV',   zh:'皇帝',        en:'The Emperor',      sym:'♈'},
  {n:'V',    zh:'教皇',        en:'The Hierophant',   sym:'♉'},
  {n:'VI',   zh:'戀人',        en:'The Lovers',       sym:'♊'},
  {n:'VII',  zh:'戰車',        en:'The Chariot',      sym:'♋'},
  {n:'VIII', zh:'力量（調整）',en:'Adjustment',       sym:'♎'},
  {n:'IX',   zh:'隱者',        en:'The Hermit',       sym:'♍'},
  {n:'X',    zh:'命運之輪',    en:'Wheel of Fortune', sym:'♃'},
  {n:'XI',   zh:'慾望',        en:'Lust',             sym:'♌'},
  {n:'XII',  zh:'吊人',        en:'The Hanged Man',   sym:'💧'},
  {n:'XIII', zh:'死神',        en:'Death',            sym:'♏'},
  {n:'XIV',  zh:'藝術',        en:'Art',              sym:'♐'},
  {n:'XV',   zh:'惡魔',        en:'The Devil',        sym:'♑'},
  {n:'XVI',  zh:'塔',          en:'The Tower',        sym:'♂'},
  {n:'XVII', zh:'星星',        en:'The Star',         sym:'♒'},
  {n:'XVIII',zh:'月亮',        en:'The Moon',         sym:'♓'},
  {n:'XIX',  zh:'太陽',        en:'The Sun',          sym:'☉'},
  {n:'XX',   zh:'永恆之火',    en:'The Aeon',         sym:'🔥'},
  {n:'XXI',  zh:'宇宙',        en:'The Universe',     sym:'♄'},
];

const SUITS = [
  {suit:'權杖', suitEn:'Wands',  sym:'🔥'},
  {suit:'聖杯', suitEn:'Cups',   sym:'💧'},
  {suit:'寶劍', suitEn:'Swords', sym:'⚡'},
  {suit:'圓盤', suitEn:'Disks',  sym:'🌍'},
];

const MINOR = [];
const COURT = ['騎士 Knight','王后 Queen','王子 Prince','公主 Princess'];
for (const s of SUITS) {
  for (let i = 1; i <= 10; i++) {
    MINOR.push({
      n: String(i),
      zh: `${s.suit}${i === 1 ? '首牌' : i + '號'}`,
      en: `${i === 1 ? 'Ace' : i} of ${s.suitEn}`,
      sym: s.sym, suit: s.suit, suitEn: s.suitEn
    });
  }
  for (const c of COURT) {
    const [zh, en] = c.split(' ');
    MINOR.push({
      n: en[0],
      zh: `${s.suit}${zh}`,
      en: `${en} of ${s.suitEn}`,
      sym: s.sym, suit: s.suit, suitEn: s.suitEn
    });
  }
}

export const DECK = [...MAJOR, ...MINOR];

export const ZONES = [
  {zh:'天空',     en:'Sky',          icon:'🌌'},
  {zh:'僕人',     en:'Servants',     icon:'🤝'},
  {zh:'土地',     en:'Land',         icon:'🌿'},
  {zh:'生命之樹', en:'Tree of Life', icon:'🌳'},
  {zh:'水缸',     en:'Water Vessel', icon:'🪣'},
  {zh:'米缸',     en:'Rice Vessel',  icon:'🌾'},
  {zh:'廚房',     en:'Kitchen',      icon:'🍳'},
  {zh:'臥室',     en:'Bedroom',      icon:'🌙'},
  {zh:'客廳',     en:'Living Room',  icon:'🏮'},
  {zh:'大門',     en:'Main Gate',    icon:'🚪'},
  {zh:'書房',     en:'Study',        icon:'📚'},
  {zh:'外部',     en:'Exterior',     icon:'🏔️'},
];

export const CHAKRAS = [
  {zh:'海底輪',     en:'Root · Muladhara',      color:'#b3462c'},
  {zh:'臍輪',       en:'Sacral · Svadhisthana', color:'#c17a2e'},
  {zh:'太陽神經叢', en:'Solar · Manipura',      color:'#b3941f'},
  {zh:'心輪',       en:'Heart · Anahata',       color:'#4c7a4f'},
  {zh:'喉輪',       en:'Throat · Vishuddha',    color:'#3d6d8a'},
  {zh:'眉心輪',     en:'Third Eye · Ajna',      color:'#6a4c8a'},
  {zh:'頂輪',       en:'Crown · Sahasrara',     color:'#8b6ea3'},
];

export function drawRandom(n = 1) {
  // 公平洗牌 Fisher–Yates：每張牌被抽到的機率完全相等
  const d = [...DECK];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d.slice(0, n).map(c => ({...c}));
}
