import { messagingApi, validateSignature } from "@line/bot-sdk";
import type { IncomingMessage, ServerResponse } from "node:http";
import { handlePostback, handleText, handleImage, handleFollow } from "../src/flow.js";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";

const client = new messagingApi.MessagingApiClient({ channelAccessToken });

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405);
    res.end("Method Not Allowed");
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks).toString("utf-8");

  const signature = (req.headers["x-line-signature"] as string) ?? "";

  if (!validateSignature(body, channelSecret, signature)) {
    res.writeHead(401);
    res.end("Unauthorized");
    return;
  }

  const payload = JSON.parse(body) as { events: messagingApi.Event[] };

  await Promise.all(
    payload.events.map(async (event) => {
      const groupId = event.source.type === "group" ? event.source.groupId : undefined;

      if (event.type === "follow" && "replyToken" in event) {
        await handleFollow(client, event.source.userId ?? "", event.replyToken);
      } else if (event.type === "postback" && "replyToken" in event) {
        await handlePostback(client, event.source.userId ?? "", event.replyToken, event.postback.data);
      } else if (event.type === "message" && "replyToken" in event) {
        if (event.message.type === "text") {
          await handleText(client, event.source.userId ?? "", event.replyToken, event.message.text, groupId);
        } else if (event.message.type === "image") {
          await handleImage(client, event.source.userId ?? "", event.replyToken, event.message.id);
        }
      }
    })
  );

  res.writeHead(200);
  res.end("OK");
}
