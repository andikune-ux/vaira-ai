import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Auth from "@/lib/_core/auth";
import { trpc } from "@/lib/trpc";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AppState } from "react-native";

import { applyConfirmedCommitmentTransaction } from "./commitment-sync";
import { AIRAX_GENERATED_RESULTS_MAX, AIRAX_GENERATED_RESULTS_RETENTION_DAYS, AIRAX_GENERATION_ACTIVITY_MAX, DEFAULT_PROFILE, EMPTY_FINANCE_STATE, type AiraConversation, type AiraGeneratedResult, type AiraGeneratedResultCollection, type AiraGenerationActivity, type AiraGenerationQueueItem, type AiraResponseMode, type Budget, type Commitment, type FinanceState, type InstructionItem, type KnowledgeItem, type SavingsGoal, type TransactionInput, type Wallet } from "./types";

const STORAGE_KEY = "airax-ai.finance-state.v1";
const storageKeyFor = (scope: string) => `${STORAGE_KEY}.${encodeURIComponent(scope)}`;

type CreateWalletInput = Omit<Wallet, "id" | "createdAt">;
type CreateBudgetInput = Omit<Budget, "id" | "createdAt">;
type CreateGoalInput = Omit<SavingsGoal, "id" | "createdAt">;
type CreateCommitmentInput = Omit<Commitment, "id" | "createdAt">;
type CreateKnowledgeInput = Omit<KnowledgeItem, "id" | "createdAt">;
type CreateInstructionInput = Omit<InstructionItem, "id" | "createdAt">;
type SaveGeneratedResultInput = Omit<AiraGeneratedResult, "id" | "createdAt">;
type CreateGeneratedResultCollectionInput = Pick<AiraGeneratedResultCollection, "name" | "accentColor">;
type RecordGenerationActivityInput = Omit<AiraGenerationActivity, "id" | "createdAt">;
type EnqueueGenerationInput = Omit<AiraGenerationQueueItem, "id" | "createdAt" | "attempts">;

type FinanceContextValue = {
  state: FinanceState;
  isHydrated: boolean;
  addWallet: (input: CreateWalletInput) => Promise<void>;
  updateWallet: (id: string, patch: Partial<CreateWalletInput>) => Promise<void>;
  removeWallet: (id: string) => Promise<{ removedTransactions: number }>;
  addConfirmedTransaction: (input: TransactionInput) => Promise<void>;
  updateConfirmedTransaction: (id: string, input: TransactionInput) => Promise<void>;
  removeTransactions: (ids: string[]) => Promise<void>;
  addBudget: (input: CreateBudgetInput) => Promise<void>;
  addGoal: (input: CreateGoalInput) => Promise<void>;
  addCommitment: (input: CreateCommitmentInput) => Promise<void>;
  updateCommitment: (id: string, input: CreateCommitmentInput) => Promise<void>;
  removeCommitment: (id: string) => Promise<void>;
  addKnowledgeItem: (input: CreateKnowledgeInput) => Promise<void>;
  updateKnowledgeItem: (id: string, patch: Partial<CreateKnowledgeInput>) => Promise<void>;
  removeKnowledgeItems: (ids: string[]) => Promise<void>;
  addInstructionItem: (input: CreateInstructionInput) => Promise<void>;
  updateInstructionItem: (id: string, patch: Partial<CreateInstructionInput>) => Promise<void>;
  removeInstructionItems: (ids: string[]) => Promise<void>;
  saveConversation: (conversation: AiraConversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (id: string, patch: Partial<Pick<AiraConversation, "title" | "isPinned" | "isArchived" | "isPrivate">>) => Promise<void>;
  restoreConversation: (id: string) => Promise<void>;
  permanentlyDeleteConversation: (id: string) => Promise<void>;
  saveGeneratedResult: (input: SaveGeneratedResultInput) => Promise<void>;
  updateGeneratedResult: (id: string, patch: Partial<Pick<AiraGeneratedResult, "isFavorite">>) => Promise<void>;
  removeGeneratedResult: (id: string) => Promise<void>;
  removeGeneratedResults: (ids: string[]) => Promise<void>;
  addGeneratedResultCollection: (input: CreateGeneratedResultCollectionInput) => Promise<void>;
  updateGeneratedResultCollection: (id: string, patch: Partial<Pick<AiraGeneratedResultCollection, "name" | "accentColor">>) => Promise<void>;
  removeGeneratedResultCollection: (id: string) => Promise<void>;
  assignGeneratedResultsToCollection: (ids: string[], collectionId: string) => Promise<void>;
  recordGenerationActivity: (input: RecordGenerationActivityInput) => Promise<void>;
  clearGenerationActivities: () => Promise<void>;
  enqueueGeneration: (input: EnqueueGenerationInput) => Promise<void>;
  removeQueuedGeneration: (id: string) => Promise<void>;
  toggleCommitment: (id: string) => Promise<void>;
  updateProfile: (patch: Partial<FinanceState["profile"]>) => Promise<void>;
  replaceAllData: (nextState: FinanceState) => Promise<{ migratedProofCount: number; unavailableProofCount: number }>;
  clearLocalData: () => Promise<void>;
  refreshStorageScope: () => Promise<FinanceState>;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const instructionSummary = (items: InstructionItem[]) => items.filter((item) => item.enabled).map((item) => item.content.trim()).filter(Boolean).join("\n\n") || "Bantu saya dengan aman dan praktis.";
const normalizeMode = (mode: unknown): AiraResponseMode => mode === "persona" || mode === "hot_pro" ? "hot_pro" : mode === "direct" || mode === "scientist" ? "scientist" : "aira";
const normalizeModeScopes = (scopes?: unknown[]) => (scopes?.length ? scopes : ["aira", "hot_pro", "scientist"]).map(normalizeMode);
const generatedResultCutoff = () => Date.now() - AIRAX_GENERATED_RESULTS_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const retainedGeneratedResults = (results: AiraGeneratedResult[]) => results.filter((result) => {
  const createdAt = new Date(result.createdAt).getTime();
  return Boolean(result.uri && result.generationKind) && Number.isFinite(createdAt) && createdAt >= generatedResultCutoff();
}).sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, AIRAX_GENERATED_RESULTS_MAX);

function normalizeState(candidate: FinanceState): FinanceState {
  const savedInstructions = (candidate.profile?.instructionItems ?? (candidate.profile?.personalInstruction ? [{ id: "instruction_utama", title: "Instruksi utama", content: candidate.profile.personalInstruction, enabled: true, createdAt: candidate.lastUpdatedAt || new Date(0).toISOString() }] : [])).map((item) => ({ ...item, modeScopes: normalizeModeScopes(item.modeScopes) }));
  return {
    ...EMPTY_FINANCE_STATE,
    ...candidate,
    profile: {
      ...EMPTY_FINANCE_STATE.profile,
      ...candidate.profile,
      aiMode: "aira",
      instructionItems: savedInstructions,
      generationNotificationsEnabled: candidate.profile?.generationNotificationsEnabled ?? true,
      prayerAlarmTone: candidate.profile?.prayerAlarmTone === "custom_audio" ? "custom_audio" : "device_default",
      prayerAlarmCustomToneUri: candidate.profile?.prayerAlarmCustomToneUri,
      prayerAlarmCustomToneName: candidate.profile?.prayerAlarmCustomToneName,
      prayerAlarmVibrationEnabled: candidate.profile?.prayerAlarmVibrationEnabled ?? EMPTY_FINANCE_STATE.profile.prayerAlarmVibrationEnabled,
      prayerCalculationMethod: [2, 3, 4, 5, 13, 20, 21, 22, 23].includes(candidate.profile?.prayerCalculationMethod ?? 20) ? candidate.profile?.prayerCalculationMethod ?? 20 : 20,
      prayerLocation: candidate.profile?.prayerLocation,
      uiPreferences: {
        ...EMPTY_FINANCE_STATE.profile.uiPreferences,
        ...candidate.profile?.uiPreferences,
        spcaEnabled: candidate.profile?.uiPreferences?.spcaPosition ? candidate.profile.uiPreferences.spcaEnabled : false,
        greetingCardEnabled: candidate.profile?.uiPreferences?.greetingCardEnabled ?? true,
        greetingCardIntervalSeconds: Math.max(5, Math.min(60, candidate.profile?.uiPreferences?.greetingCardIntervalSeconds ?? 10)),
        greetingCardEffect: candidate.profile?.uiPreferences?.greetingCardEffect === "card" ? "card" : "text",
        greetingCardAnimation: ["spin", "fade", "slide", "zoom", "flip", "bounce", "wipe", "pulse", "tilt", "blur", "random"].includes(candidate.profile?.uiPreferences?.greetingCardAnimation ?? "") ? candidate.profile?.uiPreferences?.greetingCardAnimation : "slide",
        greetingCardShareFormat: ["square", "portrait", "story"].includes(candidate.profile?.uiPreferences?.greetingCardShareFormat ?? "") ? candidate.profile?.uiPreferences?.greetingCardShareFormat : "story",
        greetingCardTemplate: ["royal", "champagne", "midnight", "pearl"].includes(candidate.profile?.uiPreferences?.greetingCardTemplate ?? "") ? candidate.profile?.uiPreferences?.greetingCardTemplate : "royal",
        spcaIconSize: candidate.profile?.uiPreferences?.spcaIconSize ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaIconSize ?? 54,
        spcaScalePercent: Math.max(0, Math.min(100, candidate.profile?.uiPreferences?.spcaScalePercent ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaScalePercent)),
        spcaTransparencyPercent: Math.max(0, Math.min(100, candidate.profile?.uiPreferences?.spcaTransparencyPercent ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaTransparencyPercent)),
        spcaAutoPatrol: candidate.profile?.uiPreferences?.spcaAutoPatrol ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaAutoPatrol,
        spcaPatrolIntervalSeconds: candidate.profile?.uiPreferences?.spcaPatrolIntervalSeconds ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaPatrolIntervalSeconds,
        spcaPatrolDurationSeconds: candidate.profile?.uiPreferences?.spcaPatrolDurationSeconds ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaPatrolDurationSeconds,
        spcaReminderBubbleEnabled: candidate.profile?.uiPreferences?.spcaReminderBubbleEnabled ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaReminderBubbleEnabled,
        spcaBubbleDurationSeconds: candidate.profile?.uiPreferences?.spcaBubbleDurationSeconds ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaBubbleDurationSeconds,
        spcaBubbleRepeatMinutes: candidate.profile?.uiPreferences?.spcaBubbleRepeatMinutes ?? EMPTY_FINANCE_STATE.profile.uiPreferences.spcaBubbleRepeatMinutes,
        quickActionOrder: candidate.profile?.uiPreferences?.quickActionOrder?.length ? candidate.profile.uiPreferences.quickActionOrder : EMPTY_FINANCE_STATE.profile.uiPreferences.quickActionOrder,
        quickPlanOrder: candidate.profile?.uiPreferences?.quickPlanOrder?.length ? candidate.profile.uiPreferences.quickPlanOrder : EMPTY_FINANCE_STATE.profile.uiPreferences.quickPlanOrder,
      },
    },
    wallets: candidate.wallets ?? [],
    transactions: candidate.transactions ?? [],
    budgets: candidate.budgets ?? [],
    goals: candidate.goals ?? [],
    commitments: candidate.commitments ?? [],
    knowledgeItems: (candidate.knowledgeItems ?? []).map((item) => ({ ...item, modeScopes: normalizeModeScopes(item.modeScopes) })),
    conversations: (candidate.conversations ?? []).filter((conversation) => !conversation.deletedAt || Date.now() - new Date(conversation.deletedAt).getTime() < 30 * 24 * 60 * 60 * 1000).map((conversation) => ({ ...conversation, mode: normalizeMode(conversation.mode), isPinned: conversation.isPinned ?? false, isArchived: conversation.isArchived ?? false })),
    generatedResults: retainedGeneratedResults((candidate.generatedResults ?? []).map((result) => ({ ...result, quality: result.quality === "high" ? "high" : result.quality === "medium" ? "medium" : undefined }))),
    generatedResultCollections: (candidate.generatedResultCollections ?? []).filter((collection) => Boolean(collection?.id && collection?.name?.trim())).map((collection) => ({ ...collection, name: collection.name.trim().slice(0, 36), accentColor: /^#[0-9a-f]{6}$/i.test(collection.accentColor ?? "") ? collection.accentColor : undefined })),
    generationActivities: (candidate.generationActivities ?? []).filter((activity) => Boolean(activity?.id && activity?.label && activity?.kind && activity?.status)).sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, AIRAX_GENERATION_ACTIVITY_MAX),
    generationQueue: (candidate.generationQueue ?? []).filter((item) => Boolean(item?.id && item?.prompt && item?.kind)).slice(0, 10),
  };
}

export function FinanceProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FinanceState>(EMPTY_FINANCE_STATE);
  const [storageScope, setStorageScope] = useState("guest");
  const [isHydrated, setIsHydrated] = useState(false);
  const storageQueue = useRef(Promise.resolve());
  const appliedRemoteScopes = useRef(new Set<string>());
  const financePull = trpc.manualAccount.finance.pull.useQuery(undefined, { enabled: isHydrated && storageScope !== "guest", staleTime: 0 });
  const financePush = trpc.manualAccount.finance.push.useMutation();
  const proofUpload = trpc.manualAccount.finance.uploadProof.useMutation();
  const proofMigrationScopes = useRef(new Set<string>());

  const refreshStorageScope = useCallback(async () => {
    const user = await Auth.getUserInfo();
    const scope = user?.openId || user?.email || "guest";
    const scopedKey = storageKeyFor(scope);
    let value = await AsyncStorage.getItem(scopedKey);
    if (!value && scope === "guest") {
      const legacy = await AsyncStorage.getItem(STORAGE_KEY);
      if (legacy) { value = legacy; await AsyncStorage.setItem(scopedKey, legacy); }
    }
    setStorageScope(scope);
    const loadedState: FinanceState = value
      ? (() => { const parsed = JSON.parse(value) as FinanceState; return parsed.version === 1 ? normalizeState(parsed) : EMPTY_FINANCE_STATE; })()
      : scope === "guest" ? EMPTY_FINANCE_STATE : { ...EMPTY_FINANCE_STATE, profile: { ...DEFAULT_PROFILE, mode: "account" as const, syncEnabled: true, displayName: user?.name ?? user?.email ?? undefined } };
    setState(loadedState);
    setIsHydrated(true);
    return loadedState;
  }, []);

  useEffect(() => { void refreshStorageScope().catch(() => { setState(EMPTY_FINANCE_STATE); setIsHydrated(true); }); }, [refreshStorageScope]);

  useEffect(() => {
    if (!isHydrated || storageScope === "guest" || financePull.isFetching || financePull.data === undefined || appliedRemoteScopes.current.has(storageScope)) return;
    appliedRemoteScopes.current.add(storageScope);
    if (!financePull.data) {
      if (state.transactions.length + state.wallets.length > 0) void financePush.mutateAsync({ payload: JSON.stringify(state) }).catch(() => undefined);
      return;
    }
    try {
      const remote = normalizeState(JSON.parse(financePull.data.payload) as FinanceState);
      const remoteTime = new Date(remote.lastUpdatedAt ?? financePull.data.updatedAt).getTime();
      const localTime = new Date(state.lastUpdatedAt ?? 0).getTime();
      if (remoteTime < localTime && state.transactions.length + state.wallets.length > 0) return;
      const mergedRemote = {
        ...remote,
        transactions: remote.transactions.map((transaction) => {
          const local = state.transactions.find((item) => item.id === transaction.id);
          return transaction.proofUri || !local?.proofUri ? transaction : { ...transaction, proofUri: local.proofUri };
        }),
      };
      setState(mergedRemote);
      void AsyncStorage.setItem(storageKeyFor(storageScope), JSON.stringify(mergedRemote));
    } catch {
      // Snapshot rusak tidak boleh menghapus data lokal.
    }
  }, [financePull.data, financePull.isFetching, financePush, isHydrated, state, storageScope]);

  const updateState = useCallback(async (updater: (previous: FinanceState) => FinanceState) => {
    let nextState: FinanceState | undefined;
    setState((previous) => {
      nextState = {
        ...updater(previous),
        lastUpdatedAt: new Date().toISOString(),
      };
      return nextState;
    });

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (nextState) {
      storageQueue.current = storageQueue.current.catch(() => undefined).then(() => AsyncStorage.setItem(storageKeyFor(storageScope), JSON.stringify(nextState)));
      await storageQueue.current;
      if (storageScope !== "guest") void financePush.mutateAsync({ payload: JSON.stringify(nextState) }).catch(() => undefined);
    }
  }, [financePush, storageScope]);

  useEffect(() => {
    if (!isHydrated || storageScope === "guest" || financePull.isFetching || financePull.data === undefined || !appliedRemoteScopes.current.has(storageScope) || proofMigrationScopes.current.has(storageScope)) return;
    const localProofs = state.transactions.filter((transaction) => Boolean(transaction.proofUri && /^(?:file|content|ph|data):/i.test(transaction.proofUri)));
    if (!localProofs.length) {
      proofMigrationScopes.current.add(storageScope);
      return;
    }
    proofMigrationScopes.current.add(storageScope);
    let cancelled = false;
    void Promise.all(localProofs.map(async (transaction) => {
      if (!transaction.proofUri) return null;
      try {
        let sourceUri = transaction.proofUri;
        if (/^ph:/i.test(sourceUri)) {
          const assetId = sourceUri.replace(/^ph:\/\//i, "");
          const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
          sourceUri = assetInfo.localUri ?? assetInfo.uri ?? sourceUri;
        }
        const mimeType = /\\.png(?:\\?|$)/i.test(sourceUri) ? "image/png" : /\\.webp(?:\\?|$)/i.test(sourceUri) ? "image/webp" : "image/jpeg";
        let readableUri = sourceUri;
        if (/^content:/i.test(readableUri) && FileSystem.cacheDirectory) {
          const cachedUri = `${FileSystem.cacheDirectory}vaira-proof-migration-${transaction.id}.jpg`;
          await FileSystem.copyAsync({ from: readableUri, to: cachedUri });
          readableUri = cachedUri;
        }
        const dataUri = /^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(readableUri)
          ? readableUri
          : `data:${mimeType};base64,${await FileSystem.readAsStringAsync(readableUri, { encoding: FileSystem.EncodingType.Base64 })}`;
        const uploaded = await proofUpload.mutateAsync({ file: dataUri, mimeType });
        return { id: transaction.id, proofUri: uploaded.storageKey };
      } catch {
        return null;
      }
    })).then((updates) => {
      if (cancelled) return;
      const valid = updates.filter((item): item is { id: string; proofUri: string } => Boolean(item));
      if (!valid.length) return;
      void updateState((previous) => ({ ...previous, transactions: previous.transactions.map((transaction) => valid.find((item) => item.id === transaction.id) ? { ...transaction, proofUri: valid.find((item) => item.id === transaction.id)?.proofUri } : transaction) }));
    });
    return () => { cancelled = true; };
  }, [financePull.data, financePull.isFetching, isHydrated, proofUpload, state.transactions, storageScope, updateState]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") return;
      void updateState((previous) => previous.profile.aiMode === "aira" ? previous : { ...previous, profile: { ...previous.profile, aiMode: "aira" } });
    });
    return () => subscription.remove();
  }, [updateState]);

  const addWallet = useCallback(
    (input: CreateWalletInput) =>
      updateState((previous) => ({
        ...previous,
        wallets: [...previous.wallets, { ...input, id: createId("wallet"), createdAt: new Date().toISOString() }],
      })),
    [updateState],
  );

  const updateWallet = useCallback(
    (id: string, patch: Partial<CreateWalletInput>) =>
      updateState((previous) => ({ ...previous, wallets: previous.wallets.map((wallet) => wallet.id === id ? { ...wallet, ...patch } : wallet) })),
    [updateState],
  );

  const removeWallet = useCallback(
    async (id: string) => {
      let removedTransactions = 0;
      await updateState((previous) => {
        removedTransactions = previous.transactions.filter((transaction) => transaction.walletId === id || transaction.toWalletId === id).length;
        return {
          ...previous,
          wallets: previous.wallets.filter((wallet) => wallet.id !== id),
          transactions: previous.transactions.filter((transaction) => transaction.walletId !== id && transaction.toWalletId !== id),
        };
      });
      return { removedTransactions };
    },
    [updateState],
  );

  const addConfirmedTransaction = useCallback(
    (input: TransactionInput) =>
      updateState((previous) => applyConfirmedCommitmentTransaction(previous, input, {
        transactionId: createId("tx"),
        commitmentId: createId("commitment"),
        createdAt: new Date().toISOString(),
      })),
    [updateState],
  );

  const updateConfirmedTransaction = useCallback(
    (id: string, input: TransactionInput) =>
      updateState((previous) => ({
        ...previous,
        transactions: previous.transactions.map((transaction) =>
          transaction.id === id ? { ...transaction, ...input, status: "confirmed" } : transaction,
        ),
      })),
    [updateState],
  );

  const removeTransactions = useCallback(
    (ids: string[]) =>
      updateState((previous) => ({
        ...previous,
        transactions: previous.transactions.filter((transaction) => !ids.includes(transaction.id)),
      })),
    [updateState],
  );

  const addBudget = useCallback(
    (input: CreateBudgetInput) =>
      updateState((previous) => ({
        ...previous,
        budgets: [...previous.budgets, { ...input, id: createId("budget"), createdAt: new Date().toISOString() }],
      })),
    [updateState],
  );

  const addGoal = useCallback(
    (input: CreateGoalInput) =>
      updateState((previous) => ({
        ...previous,
        goals: [...previous.goals, { ...input, id: createId("goal"), createdAt: new Date().toISOString() }],
      })),
    [updateState],
  );

  const addCommitment = useCallback(
    (input: CreateCommitmentInput) =>
      updateState((previous) => ({
        ...previous,
        commitments: [...previous.commitments, { ...input, id: createId("commitment"), createdAt: new Date().toISOString() }],
      })),
    [updateState],
  );

  const updateCommitment = useCallback(
    (id: string, input: CreateCommitmentInput) =>
      updateState((previous) => ({
        ...previous,
        commitments: previous.commitments.map((commitment) => commitment.id === id ? { ...commitment, ...input } : commitment),
      })),
    [updateState],
  );

  const removeCommitment = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, commitments: previous.commitments.filter((commitment) => commitment.id !== id) })),
    [updateState],
  );

  const addKnowledgeItem = useCallback(
    (input: CreateKnowledgeInput) =>
      updateState((previous) => ({
        ...previous,
        knowledgeItems: [...previous.knowledgeItems, { ...input, id: createId("knowledge"), createdAt: new Date().toISOString() }],
      })),
    [updateState],
  );

  const updateKnowledgeItem = useCallback(
    (id: string, patch: Partial<CreateKnowledgeInput>) => updateState((previous) => ({ ...previous, knowledgeItems: previous.knowledgeItems.map((item) => item.id === id ? { ...item, ...patch } : item) })),
    [updateState],
  );

  const removeKnowledgeItems = useCallback(
    (ids: string[]) => updateState((previous) => ({ ...previous, knowledgeItems: previous.knowledgeItems.filter((item) => !ids.includes(item.id)) })),
    [updateState],
  );

  const addInstructionItem = useCallback(
    (input: CreateInstructionInput) => updateState((previous) => {
      const instructionItems = [...previous.profile.instructionItems, { ...input, id: createId("instruction"), createdAt: new Date().toISOString() }];
      return { ...previous, profile: { ...previous.profile, instructionItems, personalInstruction: instructionSummary(instructionItems) } };
    }),
    [updateState],
  );

  const updateInstructionItem = useCallback(
    (id: string, patch: Partial<CreateInstructionInput>) => updateState((previous) => {
      const instructionItems = previous.profile.instructionItems.map((item) => item.id === id ? { ...item, ...patch } : item);
      return { ...previous, profile: { ...previous.profile, instructionItems, personalInstruction: instructionSummary(instructionItems) } };
    }),
    [updateState],
  );

  const removeInstructionItems = useCallback(
    (ids: string[]) => updateState((previous) => {
      const instructionItems = previous.profile.instructionItems.filter((item) => !ids.includes(item.id));
      return { ...previous, profile: { ...previous.profile, instructionItems, personalInstruction: instructionSummary(instructionItems) } };
    }),
    [updateState],
  );

  const saveConversation = useCallback(
    (conversation: AiraConversation) => updateState((previous) => {
      const existing = previous.conversations.find((item) => item.id === conversation.id);
      const nextConversation = { ...conversation, mode: normalizeMode(conversation.mode), isPrivate: conversation.isPrivate ?? existing?.isPrivate, isPinned: conversation.isPinned ?? existing?.isPinned ?? false, isArchived: conversation.isArchived ?? existing?.isArchived ?? false, deletedAt: conversation.deletedAt ?? existing?.deletedAt };
      return { ...previous, conversations: [nextConversation, ...previous.conversations.filter((item) => item.id !== conversation.id)].sort((left, right) => Number(Boolean(right.isPinned)) - Number(Boolean(left.isPinned)) || right.updatedAt.localeCompare(left.updatedAt)) };
    }),
    [updateState],
  );

  const deleteConversation = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, conversations: previous.conversations.map((conversation) => conversation.id === id ? { ...conversation, deletedAt: new Date().toISOString(), isArchived: false, isPinned: false } : conversation) })),
    [updateState],
  );

  const updateConversation = useCallback(
    (id: string, patch: Partial<Pick<AiraConversation, "title" | "isPinned" | "isArchived" | "isPrivate">>) => updateState((previous) => ({ ...previous, conversations: previous.conversations.map((conversation) => conversation.id === id ? { ...conversation, ...patch, updatedAt: new Date().toISOString() } : conversation) })),
    [updateState],
  );

  const restoreConversation = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, conversations: previous.conversations.map((conversation) => conversation.id === id ? { ...conversation, deletedAt: undefined, updatedAt: new Date().toISOString() } : conversation) })),
    [updateState],
  );

  const permanentlyDeleteConversation = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, conversations: previous.conversations.filter((conversation) => conversation.id !== id) })),
    [updateState],
  );

  const saveGeneratedResult = useCallback(
    (input: SaveGeneratedResultInput) => updateState((previous) => ({
      ...previous,
      generatedResults: retainedGeneratedResults([
        { ...input, id: createId("aira_result"), createdAt: new Date().toISOString() },
        ...previous.generatedResults.filter((result) => result.uri !== input.uri),
      ]),
    })),
    [updateState],
  );

  const removeGeneratedResult = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, generatedResults: previous.generatedResults.filter((result) => result.id !== id) })),
    [updateState],
  );

  const updateGeneratedResult = useCallback(
    (id: string, patch: Partial<Pick<AiraGeneratedResult, "isFavorite">>) => updateState((previous) => ({ ...previous, generatedResults: previous.generatedResults.map((result) => result.id === id ? { ...result, ...patch } : result) })),
    [updateState],
  );

  const removeGeneratedResults = useCallback(
    (ids: string[]) => updateState((previous) => ({ ...previous, generatedResults: previous.generatedResults.filter((result) => !ids.includes(result.id)) })),
    [updateState],
  );

  const addGeneratedResultCollection = useCallback(
    (input: CreateGeneratedResultCollectionInput) => updateState((previous) => {
      const name = input.name.trim().slice(0, 36);
      const collections = previous.generatedResultCollections ?? [];
      if (!name || collections.some((collection) => collection.name.localeCompare(name, "id", { sensitivity: "accent" }) === 0)) return previous;
      return { ...previous, generatedResultCollections: [...collections, { id: createId("aira_collection"), name, accentColor: /^#[0-9a-f]{6}$/i.test(input.accentColor ?? "") ? input.accentColor : undefined, createdAt: new Date().toISOString() }] };
    }),
    [updateState],
  );

  const updateGeneratedResultCollection = useCallback(
    (id: string, patch: Partial<Pick<AiraGeneratedResultCollection, "name" | "accentColor">>) => updateState((previous) => ({ ...previous, generatedResultCollections: (previous.generatedResultCollections ?? []).map((collection) => collection.id === id ? { ...collection, ...patch, name: patch.name?.trim().slice(0, 36) || collection.name, accentColor: patch.accentColor === undefined ? collection.accentColor : /^#[0-9a-f]{6}$/i.test(patch.accentColor) ? patch.accentColor : collection.accentColor } : collection) })),
    [updateState],
  );

  const removeGeneratedResultCollection = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, generatedResultCollections: (previous.generatedResultCollections ?? []).filter((collection) => collection.id !== id), generatedResults: previous.generatedResults.map((result) => ({ ...result, collectionIds: result.collectionIds?.filter((collectionId) => collectionId !== id) })) })),
    [updateState],
  );

  const assignGeneratedResultsToCollection = useCallback(
    (ids: string[], collectionId: string) => updateState((previous) => ({ ...previous, generatedResults: previous.generatedResults.map((result) => ids.includes(result.id) ? { ...result, collectionIds: result.collectionIds?.includes(collectionId) ? result.collectionIds : [...(result.collectionIds ?? []), collectionId] } : result) })),
    [updateState],
  );

  const recordGenerationActivity = useCallback(
    (input: RecordGenerationActivityInput) => updateState((previous) => ({ ...previous, generationActivities: [{ ...input, id: createId("aira_generation"), createdAt: new Date().toISOString(), prompt: input.prompt.slice(0, 160), durationMs: Math.max(0, Math.round(input.durationMs)) }, ...(previous.generationActivities ?? [])].slice(0, AIRAX_GENERATION_ACTIVITY_MAX) })),
    [updateState],
  );

  const clearGenerationActivities = useCallback(
    () => updateState((previous) => ({ ...previous, generationActivities: [] })),
    [updateState],
  );

  const enqueueGeneration = useCallback(
    (input: EnqueueGenerationInput) => updateState((previous) => ({ ...previous, generationQueue: [{ ...input, id: createId("aira_queue"), createdAt: new Date().toISOString(), attempts: 0 }, ...(previous.generationQueue ?? []).filter((item) => item.prompt !== input.prompt || item.kind !== input.kind)].slice(0, 10) })),
    [updateState],
  );

  const removeQueuedGeneration = useCallback(
    (id: string) => updateState((previous) => ({ ...previous, generationQueue: (previous.generationQueue ?? []).filter((item) => item.id !== id) })),
    [updateState],
  );

  const toggleCommitment = useCallback(
    (id: string) =>
      updateState((previous) => ({
        ...previous,
        commitments: previous.commitments.map((commitment) =>
          commitment.id === id ? { ...commitment, isDone: !commitment.isDone } : commitment,
        ),
      })),
    [updateState],
  );

  const updateProfile = useCallback(
    (patch: Partial<FinanceState["profile"]>) => updateState((previous) => ({ ...previous, profile: { ...previous.profile, ...patch } })),
    [updateState],
  );

  const replaceAllData = useCallback(async (nextState: FinanceState) => {
    let normalized = normalizeState(nextState);
    let migratedProofCount = 0;
    let unavailableProofCount = 0;
    if (storageScope !== "guest") {
      const localProofTransactions = normalized.transactions.filter((transaction) => Boolean(transaction.proofUri && /^(?:file|content|ph|data):/i.test(transaction.proofUri)));
      const updates = await Promise.all(localProofTransactions.map(async (transaction) => {
        try {
          const proofReference = transaction.proofUri;
          if (!proofReference) return null;
          let sourceUri = proofReference;
          if (/^ph:/i.test(sourceUri)) {
            const assetInfo = await MediaLibrary.getAssetInfoAsync(sourceUri.replace(/^ph:\/\//i, ""));
            sourceUri = assetInfo.localUri ?? assetInfo.uri ?? sourceUri;
          }
          if (/^content:/i.test(sourceUri) && FileSystem.cacheDirectory) {
            const cachedUri = `${FileSystem.cacheDirectory}vaira-offline-restore-${transaction.id}.jpg`;
            await FileSystem.copyAsync({ from: sourceUri, to: cachedUri });
            sourceUri = cachedUri;
          }
          const mimeType = /\.png(?:\?|$)/i.test(sourceUri) ? "image/png" : /\.webp(?:\?|$)/i.test(sourceUri) ? "image/webp" : "image/jpeg";
          const dataUri = /^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(sourceUri) ? sourceUri : `data:${mimeType};base64,${await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 })}`;
          const uploaded = await proofUpload.mutateAsync({ file: dataUri, mimeType });
          return { id: transaction.id, proofUri: uploaded.storageKey };
        } catch { return null; }
      }));
      const valid = updates.filter((item): item is { id: string; proofUri: string } => Boolean(item));
      migratedProofCount = valid.length;
      unavailableProofCount = updates.filter((item) => item === null).length;
      if (valid.length) normalized = { ...normalized, transactions: normalized.transactions.map((transaction) => valid.find((item) => item.id === transaction.id) ? { ...transaction, proofUri: valid.find((item) => item.id === transaction.id)?.proofUri } : transaction) };
    }
    setState(normalized);
    await AsyncStorage.setItem(storageKeyFor(storageScope), JSON.stringify(normalized));
    if (storageScope !== "guest" && migratedProofCount > 0) void financePush.mutateAsync({ payload: JSON.stringify(normalized) }).catch(() => undefined);
    return { migratedProofCount, unavailableProofCount };
  }, [financePush, proofUpload, storageScope]);

  const clearLocalData = useCallback(async () => {
    setState(EMPTY_FINANCE_STATE);
    await AsyncStorage.removeItem(storageKeyFor(storageScope));
  }, [storageScope]);

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      addWallet,
      updateWallet,
      removeWallet,
      addConfirmedTransaction,
      updateConfirmedTransaction,
      removeTransactions,
      addBudget,
      addGoal,
      addCommitment,
      updateCommitment,
      removeCommitment,
      addKnowledgeItem,
      updateKnowledgeItem,
      removeKnowledgeItems,
      addInstructionItem,
      updateInstructionItem,
      removeInstructionItems,
      saveConversation,
      deleteConversation,
      updateConversation,
      restoreConversation,
      permanentlyDeleteConversation,
      saveGeneratedResult,
      updateGeneratedResult,
      removeGeneratedResult,
      removeGeneratedResults,
      addGeneratedResultCollection,
      updateGeneratedResultCollection,
      removeGeneratedResultCollection,
      assignGeneratedResultsToCollection,
      recordGenerationActivity,
      clearGenerationActivities,
      enqueueGeneration,
      removeQueuedGeneration,
      toggleCommitment,
      updateProfile,
      replaceAllData,
      clearLocalData,
      refreshStorageScope,
    }),
    [state, isHydrated, addWallet, updateWallet, removeWallet, addConfirmedTransaction, updateConfirmedTransaction, removeTransactions, addBudget, addGoal, addCommitment, updateCommitment, removeCommitment, addKnowledgeItem, updateKnowledgeItem, removeKnowledgeItems, addInstructionItem, updateInstructionItem, removeInstructionItems, saveConversation, deleteConversation, updateConversation, restoreConversation, permanentlyDeleteConversation, saveGeneratedResult, updateGeneratedResult, removeGeneratedResult, removeGeneratedResults, addGeneratedResultCollection, updateGeneratedResultCollection, removeGeneratedResultCollection, assignGeneratedResultsToCollection, recordGenerationActivity, clearGenerationActivities, enqueueGeneration, removeQueuedGeneration, toggleCommitment, updateProfile, replaceAllData, clearLocalData, refreshStorageScope],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
