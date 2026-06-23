import { messagingApi, validateSignature } from "@line/bot-sdk";
import { handlePostback, handleText } from "../src/flow.js";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";

const client = new messagingApi.MessagingApiClient({ channelAccessToken });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!validateSignature(body, channelSecret, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body) as { events: messagingApi.Event[] };

  await Promise.all(
    payload.events.map(async (event) => {
      if (event.type === "postback" && "replyToken" in event) {
        await handlePostback(
          client,
          event.source.userId ?? "",
          event.replyToken,
          event.postback.data
        );
      } else if (
        event.type === "message" &&
        event.message.type === "text" &&
        "replyToken" in event
      ) {
        await handleText(
          client,
          event.source.userId ?? "",
          event.replyToken,
          event.message.text
        );
      }
    })
  );

  return new Response("OK");
}

export const config = { runtime: 'edge' };
