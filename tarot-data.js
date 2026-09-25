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
  {zh:'夥伴',     en:'Companion',    icon:'🤝'},
  {zh:'土地',     en:'Land',         icon:'🌿'},
  {zh:'生命之樹', en:'Tree of Life', icon:'🌳'},
  {zh:'小溪',     en:'Brook',        icon:'💧'},
  {zh:'橡實倉',   en:'Acorn Store',  icon:'🌰'},
  {zh:'廚房',     en:'Kitchen',      icon:'🍳'},
  {zh:'臥室',     en:'Bedroom',      icon:'🌙'},
  {zh:'營火',     en:'Campfire',     icon:'🏕️'},
  {zh:'大門',     en:'Main Gate',    icon:'🚪'},
  {zh:'書房',     en:'Study',        icon:'📚'},
  {zh:'遠方',     en:'Far Woods',    icon:'⛰️'},
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

// 巴哈花精 38 種（資料來源：raindeercoffee/chakra-flower）
const FLOWER_DEFS = [
  ['01','龍芽草','Agrimony'], ['02','白楊','Aspen'], ['03','山毛櫸','Beech'],
  ['04','矢車菊','Centaury'], ['05','水蕨','Cerato'], ['06','櫻桃李','Cherry Plum'],
  ['07','栗樹芽孢','Chestnut Bud'], ['08','菊苣','Chicory'], ['09','鐵線蓮','Clematis'],
  ['10','海棠','Crab Apple'], ['11','榆樹','Elm'], ['12','龍膽','Gentian'],
  ['13','金雀花','Gorse'], ['14','石楠','Heather'], ['15','冬青','Holly'],
  ['16','忍冬','Honeysuckle'], ['17','鵝耳櫪','Hornbeam'], ['18','鳳仙花','Impatiens'],
  ['19','落葉松','Larch'], ['20','溝酸醬','Mimulus'], ['21','芥末','Mustard'],
  ['22','橡樹','Oak'], ['23','橄欖','Olive'], ['24','松樹','Pine'],
  ['25','紅栗子','Red Chestnut'], ['26','岩薔薇','Rock Rose'], ['27','巖水','Rock Water'],
  ['28','線球草','Scleranthus'], ['29','聖星百合','Star of Bethlehem'], ['30','甜栗子','Sweet Chestnut'],
  ['31','馬鞭草','Vervain'], ['32','葡萄藤','Vine'], ['33','胡桃','Walnut'],
  ['34','水紫羅蘭','Water Violet'], ['35','白栗子','White Chestnut'], ['36','野生燕麥','Wild Oat'],
  ['37','野玫瑰','Wild Rose'], ['38','柳樹','Willow'],
];
const FLOWER_SYMS = ['🌸','🌼','🌷','🌺','💮','🏵️','🌻','🪷','🌹'];
export const FLOWERS = FLOWER_DEFS.map(([n, zh, en], i) => ({
  n, zh, en, sym: FLOWER_SYMS[i % FLOWER_SYMS.length], isFlower: true,
}));

export function drawFlowers(n = 1) {
  // 公平洗牌 Fisher–Yates
  const d = [...FLOWERS];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d.slice(0, n).map(c => ({...c}));
}
