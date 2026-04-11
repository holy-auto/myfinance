/**
 * 店舗情報・メニュー・料金などの一元管理ファイル。
 * 実データに差し替えるときはこのファイルだけを編集すれば良い。
 */

export const site = {
  brand: "Car Wash Homies",
  tagline: "青空の下で、愛車を一番きれいに。",
  catchCopy:
    "ていねいな手洗いと、プロのコーティングで、あなたの愛車を新車のような輝きへ。",
  address: {
    zip: "150-0001",
    full: "東京都渋谷区神宮前1-2-3 ホミーズビル1F",
    mapQuery: "東京都渋谷区神宮前1-2-3",
    lat: 35.6702,
    lng: 139.7026,
  },
  tel: "03-1234-5678",
  telDisplay: "03-1234-5678",
  lineUrl: "https://line.me/R/ti/p/@carwashhomies",
  email: "hello@carwashhomies.example.jp",
  social: {
    instagram: "https://www.instagram.com/carwashhomies",
  },
} as const;

/**
 * 営業時間（0=日, 1=月, ... 6=土）。
 * null は定休日。
 */
export const businessHours: Record<number, { open: string; close: string } | null> = {
  0: { open: "09:00", close: "18:00" }, // 日
  1: null, // 月 定休日
  2: { open: "10:00", close: "19:00" }, // 火
  3: { open: "10:00", close: "19:00" }, // 水
  4: { open: "10:00", close: "19:00" }, // 木
  5: { open: "10:00", close: "20:00" }, // 金
  6: { open: "09:00", close: "20:00" }, // 土
};

export const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export type CarSize = "K" | "S" | "M" | "L";

export const carSizes: { id: CarSize; label: string; desc: string; multiplier: number }[] = [
  { id: "K", label: "軽自動車", desc: "N-BOX / タント 等", multiplier: 0.9 },
  { id: "S", label: "コンパクト", desc: "ヤリス / フィット 等", multiplier: 1.0 },
  { id: "M", label: "セダン / SUV", desc: "プリウス / ハリアー 等", multiplier: 1.2 },
  { id: "L", label: "ミニバン / 大型SUV", desc: "アルファード / ランクル 等", multiplier: 1.4 },
];

export type MenuId = "basic" | "premium" | "coating" | "detail";

export const menus: {
  id: MenuId;
  name: string;
  duration: string;
  basePrice: number;
  description: string;
  includes: string[];
  popular?: boolean;
}[] = [
  {
    id: "basic",
    name: "ベーシック手洗い洗車",
    duration: "約45分",
    basePrice: 2500,
    description: "日常のホコリや汚れを、傷をつけずに丁寧に落とします。",
    includes: ["ボディ手洗い", "ホイール洗浄", "窓拭き", "タイヤワックス"],
  },
  {
    id: "premium",
    name: "プレミアム洗車",
    duration: "約90分",
    basePrice: 5800,
    description: "ベーシック + 鉄粉除去・水アカ落とし。月1ペースにおすすめ。",
    includes: [
      "ベーシック全工程",
      "鉄粉除去",
      "水アカ除去",
      "簡易ワックス",
      "室内掃除機がけ",
    ],
    popular: true,
  },
  {
    id: "coating",
    name: "ガラスコーティング",
    duration: "約4時間",
    basePrice: 38000,
    description: "半年間の艶と撥水をキープ。雨の日の水はじきが気持ちいい。",
    includes: ["下地処理", "2層ガラスコート", "6ヶ月保証", "撥水チェック"],
  },
  {
    id: "detail",
    name: "フルディテーリング",
    duration: "約6時間",
    basePrice: 68000,
    description: "外装も内装も徹底洗浄。大切な愛車を新車同等まで。",
    includes: [
      "プレミアム全工程",
      "室内シャンプー",
      "レザーケア",
      "エンジンルーム清掃",
      "ガラスコート",
    ],
  },
];

export type OptionId = "interior" | "engine" | "tire" | "smell";

export const options: { id: OptionId; label: string; price: number }[] = [
  { id: "interior", label: "室内徹底クリーニング", price: 4500 },
  { id: "engine", label: "エンジンルーム清掃", price: 3500 },
  { id: "tire", label: "タイヤコーティング", price: 2000 },
  { id: "smell", label: "消臭・除菌オゾン処理", price: 3000 },
];

export const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;
