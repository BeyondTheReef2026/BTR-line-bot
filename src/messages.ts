import type { Message, QuickReply } from "@line/bot-sdk";

function quickReply(items: { label: string; data: string }[]): QuickReply {
  return {
    items: items.map(({ label, data }) => ({
      type: "action",
      action: {
        type: "postback",
        label,
        data,
        displayText: label,
      },
    })),
  };
}

export function categoryMenu(): Message {
  return {
    type: "text",
    text: "こんにちは！BTR公式LINEです😊\nご用件をお選びください。",
    quickReply: quickReply([
      { label: "📦 ご注文について", data: "cat:order" },
      { label: "👤 会員登録・メルマガ", data: "cat:member" },
      { label: "🧵 ワークショップ・養成講座", data: "cat:workshop" },
      { label: "🏪 店舗について", data: "cat:store" },
      { label: "💬 その他のご相談", data: "cat:other" },
    ]),
  };
}

export function orderSubMenu(): Message {
  return {
    type: "text",
    text: "ご注文について、詳しく教えてください。",
    quickReply: quickReply([
      { label: "⏰ いつ届く？", data: "order:delivery" },
      { label: "📅 次回受注はいつ？", data: "order:next" },
      { label: "🔖 予約・キャンセル待ち", data: "order:reserve" },
      { label: "🎨 色・編み方の指定", data: "order:color" },
    ]),
  };
}

export function memberSubMenu(): Message {
  return {
    type: "text",
    text: "会員登録・メルマガについて、詳しく教えてください。",
    quickReply: quickReply([
      { label: "🎁 会員登録のメリットは？", data: "member:merit" },
      { label: "🛒 登録なしで購入できる？", data: "member:guest" },
      { label: "📧 確認メールが来ない", data: "member:email" },
    ]),
  };
}

export function workshopSubMenu(): Message {
  return {
    type: "text",
    text: "ワークショップ・養成講座について、詳しく教えてください。",
    quickReply: quickReply([
      { label: "📋 日程・内容を知りたい", data: "workshop:schedule" },
      { label: "💳 申込・支払い方法", data: "workshop:payment" },
      { label: "🤔 レベル相談・その他", data: "workshop:other" },
    ]),
  };
}

export function autoAnswer(text: string): Message {
  return { type: "text", text };
}

export function autoAnswerWithLink(text: string, label: string, url: string): Message[] {
  return [
    { type: "text", text },
    {
      type: "template",
      altText: label,
      template: {
        type: "buttons",
        text: label,
        actions: [{ type: "uri", label, uri: url }],
      },
    },
  ];
}

export function workshopScheduleAnswer(): Message[] {
  return [
    {
      type: "text",
      text: "現在開催中の講座一覧・日程はこちらからご確認いただけます。",
    },
    {
      type: "template",
      altText: "ワークショップ・養成講座ページへ",
      template: {
        type: "buttons",
        text: "ページを開く",
        actions: [
          {
            type: "uri",
            label: "🧵 ワークショップ一覧",
            uri: "https://beyondthereef.jp/collections/workshop",
          },
        ],
      },
    },
    {
      type: "template",
      altText: "認定講師養成講座ページへ",
      template: {
        type: "buttons",
        text: "認定講師養成講座はこちら",
        actions: [
          {
            type: "uri",
            label: "🎓 認定講師養成講座",
            uri: "https://beyondthereef.jp/collections/workshop-instructor",
          },
        ],
      },
    },
  ];
}

export function handoffNamePrompt(): Message {
  return {
    type: "text",
    text: "担当者よりご連絡いたします。\nまず、お名前を入力してください。",
  };
}

export function handoffPhonePrompt(): Message {
  return {
    type: "text",
    text: "ありがとうございます。\n次に、お電話番号を入力してください。",
  };
}

export function handoffMessagePrompt(): Message {
  return {
    type: "text",
    text: "最後に、ご相談の内容を入力してください。",
  };
}

export function handoffComplete(): Message {
  return {
    type: "text",
    text: "お問い合わせありがとうございます！\n担当者より改めてご連絡いたします。\n\n他にご質問があればいつでも送ってください😊",
  };
}

export function notifyGroupMessage(
  category: string,
  name: string,
  phone: string,
  message: string
): Message {
  return {
    type: "text",
    text: `【新しいお問い合わせ】\n\nカテゴリ：${category}\nお名前：${name}\n電話番号：${phone}\nご相談内容：${message}`,
  };
}
