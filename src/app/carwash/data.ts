/**
 * 店舗情報・メニュー・料金などの一元管理ファイル。
 * 実データに差し替えるときはこのファイルだけを編集すれば良い。
 */

// ─── 店舗基本情報 ────────────────────────────────────────────────
export const site = {
  brand: "車の美容外科",
  tagline: "選ばれるお車に仕上げるがモットーです。",
  catchCopy:
    "塗装状態・使用環境・年式を診断し、本当に必要な処置を選択してご提供します。車両ごとに最適な施術計画をご提案します。",
  concept: [
    "塗装状態・使用環境・年式を診断し、本当に必要な処置を選択してご提供します。",
    "車両ごとに最適な施術計画をご提案します。",
    "「車の寿命を延ばし、価値を守る」それが当院のポリシーです。",
  ],
  motto: "選ばれるお車に仕上げるがモットーです!!",
  director: {
    name: "中山 春香",
    title: "院長（代表者）",
    license: "二級自動車整備士",
    bio: [
      "国家資格 二級自動車整備士",
      "整備/磨き/コーティング実務経験 約9年",
      "イベント施工・デモ実績多数",
      "SNSを通じた情報発信・来院実績",
    ],
  },
  address: {
    zip: "339-0021",
    full: "埼玉県さいたま市岩槻区末田2421-2",
    mapQuery: "埼玉県さいたま市岩槻区末田2421-2",
    lat: 35.9449,
    lng: 139.7081,
  },
  tel: "048-606-4977",
  telDisplay: "048-606-4977",
  registrationNo: "T8810011150208",
  lineUrl: "", // LINE は不使用
  email: "",   // 問い合わせはフォーム・Instagram DM
  social: {
    instagram: "https://www.instagram.com/japanese_detailer_girl",
    instagramHandle: "@japanese_detailer_girl",
    instagramName: "車の美容外科女医 a.k.a JDG",
    x: "https://x.com/DetailerGirl",
    xHandle: "@DetailerGirl",
    xName: "車の美容外科医 aka JDG",
  },
  brands: ["Adam's Polishes"], // 取り扱い施工・販売ブランド
  freeCounseling: true,
} as const;

// ─── 営業時間 ─────────────────────────────────────────────────────
/** 0=日, 1=月, …, 6=土。null は定休日。※実際の時間が確定したら更新してください */
export const businessHours: Record<number, { open: string; close: string } | null> = {
  0: { open: "09:00", close: "18:00" }, // 日
  1: null,                               // 月 定休日
  2: { open: "10:00", close: "19:00" }, // 火
  3: { open: "10:00", close: "19:00" }, // 水
  4: { open: "10:00", close: "19:00" }, // 木
  5: { open: "10:00", close: "19:00" }, // 金
  6: { open: "09:00", close: "19:00" }, // 土
};
export const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

// ─── サービスカテゴリー ────────────────────────────────────────────
export type ServiceCategory = "wash" | "body" | "interior" | "glass" | "wheel" | "b2b";

export const serviceCategories: {
  id: ServiceCategory;
  label: string;
  short: string;
  icon: string;
}[] = [
  { id: "wash",     label: "手洗い洗車",           short: "洗車",   icon: "💧" },
  { id: "body",     label: "ボディコーティング",    short: "ボディ", icon: "✨" },
  { id: "interior", label: "シート/内装コーティング", short: "内装",  icon: "🪑" },
  { id: "glass",    label: "窓ガラスコーティング",  short: "ガラス", icon: "🔲" },
  { id: "wheel",    label: "ホイールコーティング",  short: "ホイール", icon: "⭕" },
  { id: "b2b",      label: "業者様向け",            short: "業者",   icon: "🏢" },
];

// ─── メニュー ─────────────────────────────────────────────────────
export type MenuId =
  | "wash-full"
  | "wash-simple"
  | "wash-drive"
  | "body-1st"
  | "body-2nd"
  | "body-3rd"
  | "interior"
  | "glass-front"
  | "glass-full"
  | "wheel-mounted"
  | "wheel-carry";

export const menus: {
  id: MenuId;
  category: ServiceCategory;
  name: string;
  duration: string;
  basePrice: number;
  priceLabel: string; // 表示用（〜あり）
  description: string;
  includes: string[];
  notes?: string[];
  popular?: boolean;
}[] = [
  // ── 手洗い洗車 ──────────────────────────────────────────────────
  {
    id: "wash-full",
    category: "wash",
    name: "私の手洗い洗車",
    duration: "応相談",
    basePrice: 5500,
    priceLabel: "¥5,500〜",
    description:
      "院長が1台1台丁寧に手洗いします。問診にて価格変動のご相談あり。",
    includes: ["ボディ手洗い", "ホイール洗浄", "窓拭き"],
    notes: ["問診にて価格変動のご相談あり"],
    popular: true,
  },
  {
    id: "wash-simple",
    category: "wash",
    name: "シンプル手洗い洗車",
    duration: "応相談",
    basePrice: 3500,
    priceLabel: "¥3,500〜",
    description:
      "素早く手洗いでシンプルに仕上げます。問診にて価格変動のご相談あり。",
    includes: ["ボディ手洗い", "簡易窓拭き"],
    notes: ["問診にて価格変動のご相談あり"],
  },
  {
    id: "wash-drive",
    category: "wash",
    name: "ドライブスルー HAND洗車",
    duration: "約20〜30分",
    basePrice: 2200,
    priceLabel: "¥2,200〜",
    description:
      "洗い上げのみ。汚れを擦らせたくない方・窓ガラスの視野を良くしたい方におすすめ。雨の日限定。",
    includes: ["100% HAND洗車", "窓ガラス洗浄"],
    notes: ["雨の日限定"],
  },

  // ── ボディコーティング ───────────────────────────────────────────
  {
    id: "body-1st",
    category: "body",
    name: "1st Class コーティング",
    duration: "1泊4日〜",
    basePrice: 198000,
    priceLabel: "¥198,000〜",
    description:
      "最高峰の長期保護コーティング。RECON180施工で艶・防汚・耐久性を最大化します。",
    includes: ["ケミカル洗車", "全面研磨（磨き）", "RECON180コーティング", "施工証明"],
    notes: ["全てケミカル洗車・研磨あり"],
  },
  {
    id: "body-2nd",
    category: "body",
    name: "2nd Class コーティング",
    duration: "1泊1〜7日",
    basePrice: 77000,
    priceLabel: "¥77,000〜",
    description:
      "コストパフォーマンスに優れた中長期コーティング。RECON80施工。1年経過後のメンテナンス対応あり。",
    includes: ["ケミカル洗車", "部分〜全面研磨", "RECON80コーティング"],
    notes: ["全てケミカル洗車・研磨あり", "1年経過後の状態確認に対応"],
    popular: true,
  },
  {
    id: "body-3rd",
    category: "body",
    name: "3rd Class コーティング",
    duration: "1泊1〜2日",
    basePrice: 33000,
    priceLabel: "¥33,000〜77,000",
    description:
      "手軽に始めるボディコーティング。メンテナンス次第で長く維持できます。",
    includes: ["ケミカル洗車", "研磨", "エントリーコーティング"],
    notes: ["全てケミカル洗車・研磨あり", "メンテナンス次第で持続可能"],
  },

  // ── シート/内装コーティング ─────────────────────────────────────
  {
    id: "interior",
    category: "interior",
    name: "シート/内装コーティング",
    duration: "応相談",
    basePrice: 17600,
    priceLabel: "¥17,600〜",
    description:
      "ファブリック・レザー両対応。車種とコーティング範囲に応じて料金が変わります。下の料金シミュレーターでご確認ください。",
    includes: [
      "シートコーティング",
      "ファブリック/レザー対応",
      "オプション多数あり",
    ],
    notes: ["汚れ・素材に応じて金額が前後します", "事前の問診にてすり合わせあり"],
  },

  // ── 窓ガラスコーティング ────────────────────────────────────────
  {
    id: "glass-front",
    category: "glass",
    name: "フロントガラスコーティング",
    duration: "応相談",
    basePrice: 16500,
    priceLabel: "¥16,500〜",
    description:
      "フロントガラスのみに施工。1年保証付き。サイズが大きい場合は別途。",
    includes: ["フロントガラス施工", "1年保証"],
    notes: ["サイズが大きい場合 +α", "シミや汚れのない新車価格"],
  },
  {
    id: "glass-full",
    category: "glass",
    name: "全面ガラスコーティング",
    duration: "応相談",
    basePrice: 33000,
    priceLabel: "¥33,000〜",
    description:
      "全ての窓ガラスに施工。1年保証付き。愛車検証で3年経過後も撥水性能は良好（2026.2現在）。",
    includes: ["全面ガラス施工", "1年保証"],
    notes: ["サイズ大・枚数多い場合 +α", "3年超の撥水実績あり（サイド等）"],
    popular: true,
  },

  // ── ホイールコーティング ────────────────────────────────────────
  {
    id: "wheel-mounted",
    category: "wheel",
    name: "ホイールコーティング（装着状態）",
    duration: "応相談",
    basePrice: 22000,
    priceLabel: "新車4本 ¥22,000〜",
    description:
      "お車についている状態で可能な範囲でコーティング。新車は下地処理あり。中古は要相談。",
    includes: ["装着状態で施工", "下地処理（新車）"],
    notes: ["脱着希望の場合は別途", "中古は要相談"],
  },
  {
    id: "wheel-carry",
    category: "wheel",
    name: "ホイールコーティング（持ち込み）",
    duration: "応相談",
    basePrice: 33000,
    priceLabel: "新品4本 ¥33,000〜",
    description:
      "ホイールを持ち込んでの着装施工。ボディコーティングとセットでお得。",
    includes: ["持ち込み着装施工", "下地処理（新品）"],
    notes: ["中古は要相談", "ボディコーティングとのセットがお得"],
    popular: true,
  },
];

// ─── シート/内装コーティング 料金マトリクス ────────────────────────
export type InteriorVehicleType = "kei" | "small" | "medium" | "luxury";
export type SeatRange = "driver" | "driverPassenger" | "allSeats";

export const interiorVehicleTypes: { id: InteriorVehicleType; label: string }[] = [
  { id: "kei",     label: "軽自動車" },
  { id: "small",   label: "小型車" },
  { id: "medium",  label: "中型車" },
  { id: "luxury",  label: "高級車/外車等" },
];

export const seatRanges: { id: SeatRange; label: string }[] = [
  { id: "driver",          label: "運転席のみ" },
  { id: "driverPassenger", label: "運転席+助手席" },
  { id: "allSeats",        label: "前後すべて" },
];

export const interiorPriceMatrix: Record<InteriorVehicleType, Record<SeatRange, number>> = {
  kei:     { driver: 17600, driverPassenger: 29700, allSeats: 41800 },
  small:   { driver: 23100, driverPassenger: 35200, allSeats: 59400 },
  medium:  { driver: 29700, driverPassenger: 53900, allSeats: 83600 },
  luxury:  { driver: 35200, driverPassenger: 59400, allSeats: 93500 },
};

export type InteriorAddonId =
  | "3row"
  | "combo"
  | "cleaning"
  | "doorTrim"
  | "centerConsole"
  | "steering"
  | "interiorCleaning"
  | "deodorize";

export const interiorAddons: { id: InteriorAddonId; label: string; price: number; note?: string }[] = [
  { id: "3row",             label: "3列シート",          price: 23100, note: "ハイエース等" },
  { id: "combo",            label: "コンビネーションシート", price: 8800 },
  { id: "cleaning",         label: "クリーニング",        price: 2200,  note: "1個あたり" },
  { id: "doorTrim",         label: "ドアトリム",          price: 7150,  note: "1枚あたり" },
  { id: "centerConsole",    label: "センターコンソール",   price: 5940 },
  { id: "steering",         label: "ハンドル",            price: 8360 },
  { id: "interiorCleaning", label: "車内クリーニング",    price: 22000, note: "ブロワー・ケミカル洗浄等" },
  { id: "deodorize",        label: "車内消臭",            price: 5500,  note: "除菌・拭き・パネル拭き" },
];

// ─── 業者向けサービス ──────────────────────────────────────────────
export const b2bServices = [
  "技術講習依頼",
  "中古車両仕上げ部門（車のスタイリスト）",
  "コーティング施工",
  "ルームクリーニング",
  "ガラス研磨",
  "ヘッドライト研磨",
] as const;

// ─── 予約フォーム用（シンプルな選択肢） ──────────────────────────
// carSizes は booking-form でのサイズ参考に残す
export type CarSize = "K" | "S" | "M" | "L";
export const carSizes: { id: CarSize; label: string; desc: string }[] = [
  { id: "K", label: "軽自動車",      desc: "N-BOX / タント 等" },
  { id: "S", label: "コンパクト",    desc: "ヤリス / フィット 等" },
  { id: "M", label: "セダン / SUV",  desc: "プリウス / ハリアー 等" },
  { id: "L", label: "ミニバン / 大型", desc: "アルファード / ランクル 等" },
];

export const timeSlots = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
] as const;
