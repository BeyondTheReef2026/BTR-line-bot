import { Redis } from "@upstash/redis";
import type { IncomingMessage, ServerResponse } from "node:http";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const config = { api: { bodyParser: false } };

interface Handoff {
  userId: string;
  name: string;
  category: string;
  at: string;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function fmt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const secret = process.env.ADMIN_SECRET ?? "";

  // 対応終了（POSTのみ。誤クリック・プリフェッチ対策）
  if (req.method === "POST") {
    const params = new URLSearchParams(await readBody(req));
    if (params.get("key") !== secret) { res.writeHead(401); res.end("Unauthorized"); return; }
    const user = params.get("user");
    if (user) await kv.del(`state:${user}`);
    res.writeHead(302, { Location: `/api/admin?key=${encodeURIComponent(secret)}` });
    res.end();
    return;
  }

  const url = new URL(req.url ?? "", "http://localhost");
  if (url.searchParams.get("key") !== secret) { res.writeHead(401); res.end("Unauthorized"); return; }

  // 担当者対応中(HANDOFF)のユーザーを集める
  const list: Handoff[] = [];
  let cursor = 0;
  let guard = 0;
  do {
    const [next, keys] = (await kv.scan(cursor, { match: "state:*", count: 100 })) as [string | number, string[]];
    cursor = Number(next);
    for (const k of keys) {
      const st = await kv.get<{ step?: string; category?: string; data?: { name?: string; handoffAt?: string } }>(k);
      if (st && (st.step === "HANDOFF" || st.step === "HANDOFF_CONFIRM")) {
        list.push({
          userId: k.replace(/^state:/, ""),
          name: st.data?.name ?? "",
          category: st.category ?? "",
          at: st.data?.handoffAt ?? "",
        });
      }
    }
  } while (cursor !== 0 && ++guard < 50);

  list.sort((a, b) => b.at.localeCompare(a.at));

  const rows = list.map((h) => `
    <div class="card">
      <div class="info">
        <div class="name">${esc(h.name || "（お名前未取得）")}</div>
        <div class="meta">${esc(h.category)}${h.at ? " ・ " + esc(fmt(h.at)) : ""}</div>
      </div>
      <form method="POST" action="/api/admin" onsubmit="return confirm('${esc(h.name || "このお客様")}の担当者対応を終了しますか？\\n（次回メッセージから通常のボットに戻ります）')">
        <input type="hidden" name="key" value="${esc(secret)}">
        <input type="hidden" name="user" value="${esc(h.userId)}">
        <button type="submit">対応を終了</button>
      </form>
    </div>`).join("");

  const empty = `<p class="empty">現在、担当者対応中のお客様はいません。</p>`;

  const html = `<!DOCTYPE html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>担当者対応 管理</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Hiragino Sans", sans-serif; background: #f4f6f8; color: #262626; margin: 0; padding: 20px; }
  .wrap { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 20px; color: #1F4E79; margin: 0 0 4px; }
  .sub { color: #7f7f7f; font-size: 13px; margin: 0 0 18px; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .name { font-weight: 700; font-size: 16px; }
  .meta { color: #7f7f7f; font-size: 13px; margin-top: 2px; }
  button { background: #1F4E79; color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }
  button:active { opacity: .8; }
  .empty { color: #7f7f7f; text-align: center; padding: 40px 0; }
  .bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .reload { color: #1F4E79; text-decoration: none; font-size: 14px; font-weight: 700; }
</style></head>
<body><div class="wrap">
  <div class="bar">
    <div><h1>担当者対応中のお客様</h1><p class="sub">対応が終わったら「対応を終了」を押してください（${list.length}件）</p></div>
    <a class="reload" href="/api/admin?key=${encodeURIComponent(secret)}">↻ 更新</a>
  </div>
  ${list.length ? rows : empty}
</div></body></html>`;

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}
