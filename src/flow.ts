import type { messagingApi } from "@line/bot-sdk";
import type { Message } from "@line/bot-sdk";
import { getState, setState, clearState } from "./state.js";
import { notifyStaff } from "./notify.js";
import {
  categoryMenu,
  orderSubMenu,
  memberSubMenu,
  workshopSubMenu,
  autoAnswer,
  workshopScheduleAnswer,
  handoffNamePrompt,
  handoffPhonePrompt,
  handoffMessagePrompt,
  handoffComplete,
} from "./messages.js";

const CATEGORY_LABELS: Record<string, string> = {
  order: "ご注文について",
  member: "会員登録・メルマガについて",
  workshop: "ワークショップ・養成講座について",
  store: "店舗について",
  other: "その他のご相談",
};

export async function handlePostback(
  client: messagingApi.MessagingApiClient,
  userId: string,
  replyToken: string,
  data: string
): Promise<void> {
  const reply = (messages: Message | Message[]) =>
    client.replyMessage({
      replyToken,
      messages: Array.isArray(messages) ? messages : [messages],
    });

  // カテゴリ選択
  if (data.startsWith("cat:")) {
    const cat = data.slice(4);

    if (cat === "store") {
      await clearState(userId);
      await reply(
        autoAnswer(
          "【店舗情報】\n📍 横浜市港北区日吉本町1-24-8-A\n\n🕐 営業時間：水・木・金・土・日 11:00〜17:00\n🔒 定休日：月・火・祝日\n💳 店頭お支払い：クレジットカードのみ"
        )
      );
      return;
    }

    if (cat === "other") {
      await setState(userId, { step: "HANDOFF_NAME", category: "その他のご相談" });
      await reply(handoffNamePrompt());
      return;
    }

    if (cat === "order") {
      await setState(userId, { step: "ORDER_SUB" });
      await reply(orderSubMenu());
      return;
    }

    if (cat === "member") {
      await setState(userId, { step: "MEMBER_SUB" });
      await reply(memberSubMenu());
      return;
    }

    if (cat === "workshop") {
      await setState(userId, { step: "WORKSHOP_SUB" });
      await reply(workshopSubMenu());
      return;
    }
  }

  // ご注文サブ選択
  if (data.startsWith("order:")) {
    const sub = data.slice(6);
    await clearState(userId);
    const answers: Record<string, string> = {
      delivery:
        "ご入金確認後、1〜1.5ヶ月の製作期間をいただいております。\n完全手作りのためご了承ください。",
      next: "次回受注日時が決まりましたら、トップページ・メルマガ・SNSでお知らせします。",
      reserve: "予約・キャンセル待ちは承っておらず、先着順での受注となります。",
      color: "商品によりお好きな色は選べますが、編み方のご指定はできません。",
    };
    await reply(autoAnswer(answers[sub] ?? "ご質問ありがとうございます。"));
    return;
  }

  // 会員登録サブ選択
  if (data.startsWith("member:")) {
    const sub = data.slice(7);
    await clearState(userId);
    const answers: Record<string, string> = {
      merit: "メルマガ希望にすると次回受注日や新作情報をお届けし、ご注文時の住所入力も省けます。",
      guest: "ご購入は会員様限定です。\n登録はどなた様でも無料ですのでお気軽にご登録ください。",
      email:
        "迷惑メール設定をご確認ください。\nbeyondthereef.jpからのメールを受信できるようフィルター設定をお願いします。",
    };
    await reply(autoAnswer(answers[sub] ?? "ご質問ありがとうございます。"));
    return;
  }

  // ワークショップサブ選択
  if (data.startsWith("workshop:")) {
    const sub = data.slice(9);

    if (sub === "schedule") {
      await clearState(userId);
      await reply(workshopScheduleAnswer());
      return;
    }

    if (sub === "payment") {
      await clearState(userId);
      await reply(
        autoAnswer(
          "各講座ページからそのままお申し込みいただけます。\n\n💳 お支払い方法：クレジットカードまたはPayPay\n（現金払いは対応しておりません）\n\n店頭でのお支払いも可能です。"
        )
      );
      return;
    }

    if (sub === "other") {
      await setState(userId, {
        step: "HANDOFF_NAME",
        category: CATEGORY_LABELS.workshop,
      });
      await reply(handoffNamePrompt());
      return;
    }
  }
}

export async function handleText(
  client: messagingApi.MessagingApiClient,
  userId: string,
  replyToken: string,
  text: string
): Promise<void> {
  const reply = (messages: Message | Message[]) =>
    client.replyMessage({
      replyToken,
      messages: Array.isArray(messages) ? messages : [messages],
    });

  const state = await getState(userId);

  // 状態なし or 初回 → カテゴリ選択
  if (!state || state.step === "CATEGORY") {
    await setState(userId, { step: "CATEGORY" });
    await reply(categoryMenu());
    return;
  }

  // 担当者引き継ぎフロー
  if (state.step === "HANDOFF_NAME") {
    await setState(userId, {
      ...state,
      step: "HANDOFF_PHONE",
      handoffData: { name: text },
    });
    await reply(handoffPhonePrompt());
    return;
  }

  if (state.step === "HANDOFF_PHONE") {
    await setState(userId, {
      ...state,
      step: "HANDOFF_MSG",
      handoffData: { ...state.handoffData, phone: text },
    });
    await reply(handoffMessagePrompt());
    return;
  }

  if (state.step === "HANDOFF_MSG") {
    const { category = "不明", handoffData = {} } = state;
    const { name = "未入力", phone = "未入力" } = handoffData;

    await clearState(userId);
    await reply(handoffComplete());
    await notifyStaff(client, category, name, phone, text);
    return;
  }

  // それ以外はカテゴリ選択に戻す
  await setState(userId, { step: "CATEGORY" });
  await reply(categoryMenu());
}
