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

export function categoryMenu(): Message {
  return text(
    "こんにちは！BTR公式LINEです😊\n\nまず、お問い合わせのカテゴリをお選びください。",
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
      { label: "🎯 受講資格・レベル相談", data: "wtype:level" 
