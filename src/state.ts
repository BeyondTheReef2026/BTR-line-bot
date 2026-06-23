import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export type Step =
  | "CATEGORY"
  // 1. ご購入のお客様
  | "P_EMAIL" | "P_ORDER" | "P_NAME" | "P_TYPE" | "P_DETAIL" | "P_PHOTO"
  // 2. 修理・メンテナンス
  | "R_EMAIL" | "R_ORDER" | "R_NAME" | "R_DETAIL" | "R_PHOTO"
  // 3. 一般（購入前）
  | "G_EMAIL" | "G_NAME" | "G_TYPE" | "G_DETAIL" | "G_PHOTO"
  // 4. ワークショップ
  | "W_EMAIL" | "W_NAME" | "W_TYPE" | "W_DETAIL";

export interface UserState {
  step: Step;
  category?: string;
  data?: Record<string, string>;
}

const TTL = 60 * 60 * 24;

export async function getState(userId: string): Promise<UserState | null> {
  return kv.get<UserState>(`state:${userId}`);
}

export async function setState(userId: string, state: UserState): Promise<void> {
  await kv.set(`state:${userId}`, state, { ex: TTL });
}

export async function clearState(userId: string): Promise<void> {
  await kv.del(`state:${userId}`);
}
