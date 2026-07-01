import type { Message, QuickReply } from "@line/bot-sdk";

function qr(items: { label: string; data: string }[]): QuickReply {
  return {
    items: items.map(({ label, data }) => ({
      type: "action",
      action: { type: "postback", label, data, displayText: label },
    })),
  };
}

function text(t: string, quickReply?: QuickReply): Message {
  return quickReply ? { type: "text", text: t, quickReply } : { type: "text", text: t };
}

interface CarouselCard {
  title: string;
  imageUrl: string;
  linkUrl: string;
  utmCampaign: string;
  buttonLabel?: string;
}

function withUtm(url: string, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "line");
  u.searchParams.set("utm_medium", "social");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

const WELCOME_CARDS: CarouselCard[] = [
  { title: "500円OFFクーポン", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=500円OFFクーポン", linkUrl: "https://beyondthereef.jp/discount/BTR-LINE?redirect=/", utmCampaign: "coupon", buttonLabel: "クーポンを使う（自動適用）" },
  { title: "新着アイテム", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=新着アイテム", linkUrl: "https://beyondthereef.jp/collections/feature", utmCampaign: "new_items" },
  { title: "ランキング", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=ランキング", linkUrl: "https://beyondthereef.jp/collections/ranking", utmCampaign: "ranking" },
  { title: "オリゾン", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=オリゾン", linkUrl: "https://beyondthereef.jp/collections/horizon", utmCampaign: "horizon" },
  { title: "ワークショップ", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=ワークショップ", linkUrl: "https://beyondthereef.jp/collections/workshop", utmCampaign: "workshop" },
  { title: "アトリエ店舗", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=アトリエ店舗", linkUrl: "https://beyondthereef.jp/pages/atelier-event", utmCampaign: "atelier" },
  { title: "キット", imageUrl: "https://placehold.co/600x400/EEE/31343C?text=キット", linkUrl: "https://beyondthereef.jp/collections/kit", utmCampaign: "kit" },
];

export function welcomeGreeting(): Message {
  return text(
    "お友だち登録ありがとうございます🤍\n" +
    "BEYOND THE REEFの公式LINEです。\n\n" +
    "ご登録のお礼に、お買い物にお使いいただけるクーポンをお届けいたします✨\n\n" +
    "新作のご案内やワークショップの情報のほか、このLINEだけでそっとお届けする情報なども、ご用意してまいります。お楽しみに！\n\n" +
    "BEYOND THE REEF"
  );
}

export function welcomeCarousel(): Message {
  return {
    type: "flex",
    altText: "BEYOND THE REEF公式LINEへようこそ！",
    contents: {
      type: "carousel",
      contents: WELCOME_CARDS.map((card) => ({
        type: "bubble",
        size: "kilo",
        hero: {
          type: "image",
          url: card.imageUrl,
          size: "full",
          aspectRatio: "20:13",
          aspectMode: "cover",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            { type: "text", text: card.title, weight: "bold", size: "md", wrap: true },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#31343C",
              action: { type: "uri", label: card.buttonLabel ?? "詳細はこちら", uri: withUtm(card.linkUrl, card.utmCampaign) },
            },
          ],
        },
      })),
    },
  };
}

export function categoryMenu(): Message {
  return text(
    "こんにちは！BEYOND THE REEF公式LINEです😊\n\nまず、お問い合わせのカテゴリをお選びください。",
    qr([
      { label: "📦 ご購入のお客様", data: "cat:purchase" },
      { label: "🔧 修理・メンテナンス", data: "cat:repair" },
      { label: "🙋 一般（購入前）", data: "cat:general" },
      { label: "🧵 ワークショップ・講座", data: "cat:workshop" },
    ])
  );
}

export function askEmail(): Message {
  return text("メールアドレスを入力してください。\n（例：example@email.com）");
}

export function askOrderNo(): Message {
  return text("ご注文番号（4桁）を入力してください。\n（例：1234）");
}

export function askName(): Message {
  return text("お客様のお名前を入力してください。");
}

export function askDetail(): Message {
  return text("お問い合わせの詳細をご記入ください。");
}

export function askPhoto(): Message {
  return text(
    "商品の写真があれば送ってください📷\n（任意・不要な場合は「スキップ」と入力してください）"
  );
}

export function purchaseTypeMenu(): Message {
  return text(
    "お問い合わせの種類をお選びください。",
    qr([
      { label: "📋 注文内容の確認", data: "ptype:order_check" },
      { label: "📍 お届け先住所の変更", data: "ptype:address" },
      { label: "🚚 配送状況・日時変更", data: "ptype:delivery" },
      { label: "⚠️ 商品に不備がある", data: "ptype:defect" },
    ])
  );
}

export function generalTypeMenu(): Message {
  return text(
    "お問い合わせの種類をお選びください。",
    qr([
      { label: "🧶 商品仕様について", data: "gtype:product_spec" },
      { label: "🛒 商品販売について", data: "gtype:product_sale" },
      { label: "🔐 ログインできない", data: "gtype:login" },
      { label: "📧 メルマガが届かない", data: "gtype:newsletter" },
      { label: "✉️ 登録メアドの変更", data: "gtype:email_change" },
      { label: "🗑️ アカウント削除", data: "gtype:delete" },
      { label: "💬 その他", data: "gtype:other" },
    ])
  );
}

export function workshopTypeMenu(): Message {
  return text(
    "お問い合わせの種類をお選びください。",
    qr([
      { label: "📚 講座の内容・カリキュラム", data: "wtype:curriculum" },
      { label: "📅 日程・スケジュール", data: "wtype:schedule" },
      { label: "🎯 受講資格・レベル相談", data: "wtype:level" },
      { label: "💳 申込・支払い方法", data: "wtype:payment" },
      { label: "💬 その他", data: "wtype:other" },
    ])
  );
}

export function inquiryComplete(): Message {
  return text(
    "お問い合わせありがとうございます！\n\n" +
    "担当者より改めてご連絡いたします。\n" +
    "※ご返信は翌営業日以降に順次対応いたします。\n" +
    "※土日・祝日・お盆・年末年始は休業となります。\n\n" +
    "他にご質問があればいつでもどうぞ😊"
  );
}

export function notifyGroupMessage(fields: Record<string, string>): Message {
  const lines = ["【新しいお問い合わせ】", ""];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}：${value}`);
  }
  return { type: "text", text: lines.join("\n") };
}
