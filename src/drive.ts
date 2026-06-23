import { google } from "googleapis";

export async function uploadImageToDrive(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!folderId || !serviceAccountJson) return "（Drive未設定）";

  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  const { Readable } = await import("node:stream");
  const stream = Readable.from(imageBuffer);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: "image/jpeg",
      body: stream,
    },
    fields: "id, webViewLink",
  });

  return res.data.webViewLink ?? res.data.id ?? "（リンク取得失敗）";
}
