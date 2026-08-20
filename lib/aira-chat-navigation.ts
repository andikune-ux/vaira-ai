import type { AiraConversation, ChatAttachmentInfo } from "@/lib/finance/types";

export type GeneratedAiraAsset = ChatAttachmentInfo & { request: string; message: string };

export type AiraChatCommand =
  | { type: "new" }
  | { type: "open"; conversation: AiraConversation }
  | { type: "delete"; id: string }
  | { type: "toggle-private"; conversation: AiraConversation };

export type AiraGenerationPanelCommand =
  | { type: "open-create" }
  | { type: "open-templates" }
  | { type: "open-gallery" }
  | { type: "open-compare" }
  | { type: "open-queue" }
  | { type: "cancel-current" }
  | { type: "regenerate"; prompt: string; kind: NonNullable<ChatAttachmentInfo["generationKind"]>; quality?: ChatAttachmentInfo["generationQuality"] };

type Listener = (command: AiraChatCommand) => void;
let listener: Listener | null = null;
let generatedAssetListener: ((asset: GeneratedAiraAsset) => void) | null = null;
let generationPanelListener: ((command: AiraGenerationPanelCommand) => void) | null = null;
let pendingGenerationPanelCommand: AiraGenerationPanelCommand | null = null;

export function subscribeAiraChatCommands(nextListener: Listener) {
  listener = nextListener;
  return () => {
    if (listener === nextListener) listener = null;
  };
}

export function requestAiraChatCommand(command: AiraChatCommand) {
  listener?.(command);
}

export function subscribeAiraGeneratedAssets(nextListener: (asset: GeneratedAiraAsset) => void) {
  generatedAssetListener = nextListener;
  return () => { if (generatedAssetListener === nextListener) generatedAssetListener = null; };
}

export function requestAiraGeneratedAsset(asset: GeneratedAiraAsset) {
  generatedAssetListener?.(asset);
}

export function subscribeAiraGenerationPanelCommands(nextListener: (command: AiraGenerationPanelCommand) => void) {
  generationPanelListener = nextListener;
  if (pendingGenerationPanelCommand) { nextListener(pendingGenerationPanelCommand); pendingGenerationPanelCommand = null; }
  return () => { if (generationPanelListener === nextListener) generationPanelListener = null; };
}

export function requestAiraGenerationPanelCommand(command: AiraGenerationPanelCommand) {
  if (generationPanelListener) generationPanelListener(command);
  else pendingGenerationPanelCommand = command;
}
