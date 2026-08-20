import { AiraChatNavigation } from "@/components/aira-chat-navigation";
import { AiraGuestPreview } from "@/components/aira-guest-preview";
import { AiraGenerationPanel } from "@/components/aira-generation-panel";
import { AiraPromptTemplates } from "@/components/aira-prompt-templates";
import { AiraABCompare } from "@/components/aira-ab-compare";
import { AiraGenerationQueueControl } from "@/components/aira-generation-queue-control";
import { AiraModeProvider } from "@/lib/aira-mode-context";
import { AiraChatScreen } from "@/components/aira-chat-screen";
import { useFinance } from "@/lib/finance/finance-context";

export default function ChatScreen() {
  const { state } = useFinance();
  if (state.profile.mode === "guest") return <AiraGuestPreview />;
  return <AiraModeProvider><AiraChatScreen /><AiraChatNavigation /><AiraPromptTemplates /><AiraABCompare /><AiraGenerationQueueControl /><AiraGenerationPanel /></AiraModeProvider>;
}
