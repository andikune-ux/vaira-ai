import type { CommitmentKind, CommitmentTransactionFlow, FinanceState, TransactionInput, TransactionKind } from "./types";

export const COMMITMENT_FLOW_OPTIONS: readonly {
  flow: CommitmentTransactionFlow;
  label: string;
  description: string;
  kind: TransactionKind;
  commitmentKind: CommitmentKind;
  category: string;
}[] = [
  { flow: "debt_received", label: "Hutang diterima", description: "Dana masuk dan hutang baru dicatat.", kind: "income", commitmentKind: "debt", category: "Hutang diterima" },
  { flow: "debt_payment", label: "Bayar hutang", description: "Dana keluar dan sisa hutang berkurang.", kind: "expense", commitmentKind: "debt", category: "Pembayaran hutang" },
  { flow: "receivable_issued", label: "Piutang diberikan", description: "Dana keluar dan piutang baru dicatat.", kind: "expense", commitmentKind: "receivable", category: "Piutang diberikan" },
  { flow: "receivable_payment", label: "Terima piutang", description: "Dana masuk dan sisa piutang berkurang.", kind: "income", commitmentKind: "receivable", category: "Penerimaan piutang" },
] as const;

export const isCommitmentTransactionFlow = (value: string | undefined): value is CommitmentTransactionFlow =>
  COMMITMENT_FLOW_OPTIONS.some((option) => option.flow === value);

export const commitmentFlowDetails = (flow: CommitmentTransactionFlow) =>
  COMMITMENT_FLOW_OPTIONS.find((option) => option.flow === flow)!;

export const isNewCommitmentFlow = (flow: CommitmentTransactionFlow) =>
  flow === "debt_received" || flow === "receivable_issued";

export const isSettlementCommitmentFlow = (flow: CommitmentTransactionFlow) =>
  flow === "debt_payment" || flow === "receivable_payment";

export const defaultCommitmentTitle = (flow: CommitmentTransactionFlow, counterparty?: string) => {
  const person = counterparty?.trim();
  if (flow === "debt_received") return person ? `Hutang dari ${person}` : "Hutang dari transaksi";
  return person ? `Piutang ke ${person}` : "Piutang dari transaksi";
};

export function applyConfirmedCommitmentTransaction(
  previous: FinanceState,
  input: TransactionInput,
  identity: { transactionId: string; commitmentId: string; createdAt: string },
): FinanceState {
  const flow = input.commitmentFlow;
  const details = flow ? commitmentFlowDetails(flow) : undefined;
  const validFlow = Boolean(details && details.kind === input.kind);
  const transaction = { ...input, id: identity.transactionId, status: "confirmed" as const, createdAt: identity.createdAt };
  const createdCommitment = validFlow && flow && isNewCommitmentFlow(flow)
    ? {
        id: identity.commitmentId,
        title: defaultCommitmentTitle(flow, input.counterpartyName),
        amount: input.amount,
        remainingAmount: input.amount,
        kind: details!.commitmentKind,
        counterparty: input.counterpartyName?.trim() || undefined,
        isRecurring: false,
        isDone: false,
        createdAt: identity.createdAt,
      }
    : undefined;
  return {
    ...previous,
    transactions: [transaction, ...previous.transactions],
    commitments: [
      ...previous.commitments.map((commitment) => {
        const isSettlement = Boolean(
          validFlow && flow && isSettlementCommitmentFlow(flow) && input.commitmentId === commitment.id &&
          details?.commitmentKind === commitment.kind && !commitment.isDone,
        );
        if (!isSettlement) return commitment;
        const remaining = Math.max(0, (commitment.remainingAmount ?? commitment.amount ?? 0) - input.amount);
        return { ...commitment, remainingAmount: remaining, isDone: remaining === 0 };
      }),
      ...(createdCommitment ? [createdCommitment] : []),
    ],
  };
}
