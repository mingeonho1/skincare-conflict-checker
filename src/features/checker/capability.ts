import { env } from "@/lib/env";

export function getCapability(): { geminiEnabled: boolean } {
  return { geminiEnabled: Boolean(env.GEMINI_API_KEY) };
}
