import { messagingApi } from "@line/bot-sdk";
import { notifyGroupMessage } from "./messages.js";

export async function notifyStaff(
  client: messagingApi.MessagingApiClient,
  category: string,
  name: string,
  phone: string,
  message: string
): Promise<void> {
  const groupId = process.env.LINE_NOTIFY_GROUP_ID;
  if (!groupId) return;

  await client.pushMessage({
    to: groupId,
    messages: [notifyGroupMessage(category, name, phone, message)],
  });
}
