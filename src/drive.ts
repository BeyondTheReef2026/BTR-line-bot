import { createSign } from "node:crypto";

async function getAccessToken(credentials: Record<string, string>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(credentials.private_key, "base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const json = await res.json() as { access_token: string };
  return json.access_token;
}

export async function uploadImageToDrive(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!folderId || !serviceAccountJson) return "（Drive未設定）";

  const credentials = JSON.parse(serviceAccountJson);
  const token = await getAccessToken(credentials);

  const metadata = JSON.stringify({ name: filename, parents: [folderId] });
  const boundary = "boundary_btr_line";
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: image/jpeg\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  const json = await res.json() as { webViewLink?: string; id?: string };
  return json.webViewLink ?? json.id ?? "（リンク取得失敗）";
}
