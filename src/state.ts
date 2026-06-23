import { kv } from "@vercel/kv";

export type Step =
  | "CATEGORY"
  | "ORDER_SUB"
  | "MEMBER_SUB"
  | "WORKSHOP_SUB"
  | "HANDOFF_NAME"
  | "HANDOFF_PHONE"
  | "HANDOFF_MSG";

export interface UserState {
  step: Step;
  category?: string;
  handoffData?: {
    name?: string;
    phone?: string;
  };
}

const TTL = 60 * 60 * 24; // 24時間

export async function getState(userId: string): Promise<UserState | null> {
  return kv.get<UserState>(`state:${userId}`);
}

export async function setState(userId: string, state: UserState): Promise<void> {
  await kv.set(`state:${userId}`, state, { ex: TTL });
}

export async function clearState(userId: string): Promise<void> {
  await kv.del(`state:${userId}`);
}
