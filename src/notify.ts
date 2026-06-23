import { messagingApi } from "@line/bot-sdk";

export async function notifyStaff(
  client: messagingApi.MessagingApiClient,
  fields: Record<string, string>
): Promise<void> {
  const groupId = process.env.LINE_NOTIFY_GROUP_ID;
  if (!groupId) return;

  const lines = ["【新しいお問い合わせ】", ""];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}：${value}`);
  }

  await client.pushMessage({
    to: groupId,
    messages: [{ type: "text", text: lines.join("\n") }],
  });
}
