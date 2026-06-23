import type { messagingApi } from "@line/bot-sdk";
import type { Message } from "@line/bot-sdk";
import { getState, setState, clearState } from "./state.js";
import { notifyStaff } from "./notify.js";
import {
  categoryMenu,
  askEmail, askOrderNo, askName, askDetail, askPhoto,
  purchaseTypeMenu, generalTypeMenu, workshopTypeMenu,
} from "./messages.js";

const PURCHASE_TYPES: Record<string, string> = {
  "ptype:order_check": "注文内容のご確認",
  "ptype:address":     "お届け先住所の変更",
  "ptype:delivery":    "配送状況・配送日時変更",
  "ptype:defect":      "商品に不備・お気づきの点がある",
};

const GENERAL_TYPES: Record<string, string> = {
  "gtype:product_spec":  "商品仕様について",
  "gtype:product_sale":  "商品販売について",
  "gtype:login":         "ログインできない",
  "gtype:newsletter":    "メルマガが届かない",
  "gtype:email_change":  "登録メアドの変更",
  "gtype:delete":        "アカウントの削除",
  "gtype:other":         "その他",
};

const WORKSHOP_TYPES: Record<string, string> = {
  "wtype:curriculum": "講座の内容・カリキュラム",
  "wtype:schedule":   "日程・スケジュール",
  "wtype:level":      "受講資格・レベル相談",
  "wtype:payment":    "お申し込み・お支払い方法",
  "wtype:other":      "その他",
};

export async function handlePostback(
  client: messagingApi.MessagingApiClient,
  userId: string,
  replyToken: string,
  data: string
): Promise<void> {
  const reply = (msgs: Message | Message[]) =>
    client.replyMessage({ replyToken, messages: Array.isArray(msgs) ? msgs : [msgs] });

  if (data === "cat:purchase") {
    await setState(userId, { step: "P_EMAIL", category: "ご購入のお客様", data: {} });
    await reply(askEmail());
    return;
  }
  if (data === "cat:repair") {
    await setState(userId, { step: "R_EMAIL", category: "修理・メンテナンス", data: {} });
    await reply(askEmail());
    return;
  }
  if (data === "cat:general") {
    await setState(userId, { step: "G_EMAIL", category: "一般（購入前）", data: {} });
    await reply(askEmail());
    return;
  }
  if (data === "cat:workshop") {
    await setState(userId, { step: "W_EMAIL", category: "ワークショップ・養成講座", data: {} });
    await reply(askEmail());
    return;
  }

  if (data in PURCHASE_TYPES) {
    const state = await getState(userId);
    if (!state) { await reply(categoryMenu()); return; }
    await setState(userId, { ...state, step: "P_DETAIL", data: { ...state.data, inquiryType: PURCHASE_TYPES[data] } });
    await reply(askDetail());
    return;
  }

  if (data in GENERAL_TYPES) {
    const state = await getState(userId);
    if (!state) { await reply(categoryMenu()); return; }
    await setState(userId, { ...state, step: "G_DETAIL", data: { ...state.data, inquiryType: GENERAL_TYPES[data] } });
    await reply(askDetail());
    return;
  }

  if (data in WORKSHOP_TYPES) {
    const state = await getState(userId);
    if (!state) { await reply(categoryMenu()); return; }
    await setState(userId, { ...state, step: "W_DETAIL", data: { ...state.data, inquiryType: WORKSHOP_TYPES[data] } });
    await reply(askDetail());
    return;
  }
}

export async function handleText(
  client: messagingApi.MessagingApiClient,
  userId: string,
  replyToken: string,
  text: string
): Promise<void> {
  const reply = (msgs: Message | Message[]) =>
    client.replyMessage({ replyToken, messages: Array.isArray(msgs) ? msgs : [msgs] });

  const state = await getState(userId);

  if (!state || state.step === "CATEGORY") {
    await setState(userId, { step: "CATEGORY" });
    await reply(categoryMenu());
    return;
  }

  const d = state.data ?? {};

  switch (state.step) {
    case "P_EMAIL":
      await setState(userId, { ...state, step: "P_ORDER", data: { ...d, email: text } });
      await reply(askOrderNo());
      break;
    case "P_ORDER":
      await setState(userId, { ...state, step: "P_NAME", data: { ...d, orderNo: text } });
      await reply(askName());
      break;
    case "P_NAME":
      await setState(userId, { ...state, step: "P_TYPE", data: { ...d, name: text } });
      await reply(purchaseTypeMenu());
      break;
    case "P_DETAIL":
      await setState(userId, { ...state, step: "P_PHOTO", data: { ...d, detail: text } });
      await reply(askPhoto());
      break;
    case "P_PHOTO":
      await finishInquiry(client, userId, replyToken, state.category ?? "", {
        ...d, photo: text.trim() === "スキップ" ? "なし" : text,
      });
      break;

    case "R_EMAIL":
      await setState(userId, { ...state, step: "R_ORDER", data: { ...d, email: text } });
      await reply(askOrderNo());
      break;
    case "R_ORDER":
      await setState(userId, { ...state, step: "R_NAME", data: { ...d, orderNo: text } });
      await reply(askName());
      break;
    case "R_NAME":
      await setState(userId, { ...state, step: "R_DETAIL", data: { ...d, name: text } });
      await reply(askDetail());
      break;
    case "R_DETAIL":
      await setState(userId, { ...state, step: "R_PHOTO", data: { ...d, detail: text } });
      await reply(askPhoto());
      break;
    case "R_PHOTO":
      await finishInquiry(client, userId, replyToken, state.category ?? "", {
        ...d, photo: text.trim() === "スキップ" ? "なし" : text,
      });
      break;

    case "G_EMAIL":
      await setState(userId, { ...state, step: "G_NAME", data: { ...d, email: text } });
      await reply(askName());
      break;
    case "G_NAME":
      await setState(userId, { ...state, step: "G_TYPE", data: { ...d, name: text } });
      await reply(generalTypeMenu());
      break;
    case "G_DETAIL":
      await setState(userId, { ...state, step: "G_PHOTO", data: { ...d, detail: text } });
      await reply(askPhoto());
      break;
    case "G_PHOTO":
      await finishInquiry(client, userId, replyToken, state.category ?? "", {
        ...d, photo: text.trim() === "スキップ" ? "なし" : text,
      });
      break;

    case "W_EMAIL":
      await setState(userId, { ...state, step: "W_NAME", data: { ...d, email: text } });
      await reply(askName());
      break;
    case "W_NAME":
      await setState(userId, { ...state, step: "W_TYPE", data: { ...d, name: text } });
      await reply(workshopTypeMenu());
      break;
    case "W_DETAIL":
      await finishInquiry(client, userId, replyToken, state.category ?? "", {
        ...d, detail: text,
      });
      break;

    default:
      await setState(userId, { step: "CATEGORY" });
      await reply(categoryMenu());
  }
}

export async function handleImage(
  client: messagingApi.MessagingApiClient,
  userId: string,
  replyToken: string,
  messageId: string
): Promise<void> {
  const reply = (msgs: Message | Message[]) =>
    client.replyMessage({ replyToken, messages: Array.isArray(msgs) ? msgs : [msgs] });

  const state = await getState(userId);
  if (!state) { await reply(categoryMenu()); return; }

  const photoSteps = ["P_PHOTO", "R_PHOTO", "G_PHOTO"];
  if (photoSteps.includes(state.step)) {
    await finishInquiry(client, userId, replyToken, state.category ?? "", {
      ...state.data, photo: `画像あり（ID: ${messageId}）`,
    });
  }
}

async function finishInquiry(
  client: messagingApi.MessagingApiClient,
  userId: string,
  replyToken: string,
  category: string,
  data: Record<string, string>
): Promise<void> {
  await clearState(userId);

  const labelMap: Record<string, string> = {
    email:       "メールアドレス",
    orderNo:     "ご注文番号",
    name:        "お名前",
    inquiryType: "お問い合わせの種類",
    detail:      "お問い合わせ詳細",
    photo:       "添付写真",
  };

  const fields: Record<string, string> = { カテゴリ: category };
  for (const [key, label] of Object.entries(labelMap)) {
    if (data[key]) fields[label] = data[key];
  }

  await client.replyMessage({
    replyToken,
    messages: [{
      type: "text",
      text: "お問い合わせありがとうございます！\n\n担当者より改めてご連絡いたします。\n※ご返信は翌営業日以降に順次対応いたします。\n※土日・祝日・お盆・年末年始は休業となります。\n\n他にご質問があればいつでもどうぞ😊",
    }],
  });
  await notifyStaff(client, fields);
}
