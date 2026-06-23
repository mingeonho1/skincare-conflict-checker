import { getCapability } from "@/features/checker/capability";
import { HomeClient } from "./HomeClient";

export default function HomePage() {
  const { geminiEnabled } = getCapability();
  return <HomeClient geminiEnabled={geminiEnabled} />;
}
