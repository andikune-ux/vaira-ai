export type WalletKind = "bank" | "e_wallet" | "cash" | "asset";
export type TransactionKind = "income" | "expense" | "transfer";
export type TransactionOrigin = "manual" | "ai_chat" | "ocr" | "voice" | "recurring";
export type TransactionStatus = "draft" | "confirmed";
export type CommitmentTransactionFlow = "debt_received" | "debt_payment" | "receivable_issued" | "receivable_payment";
export type TransactionPaymentMethod = "bank_transfer" | "qris" | "cash" | "unknown";
export type AiraResponseMode = "aira" | "hot_pro" | "scientist";
export type GreetingCardAnimation = "spin" | "fade" | "slide" | "zoom" | "flip" | "bounce" | "wipe" | "pulse" | "tilt" | "blur" | "random";
export type GreetingCardEffect = "text" | "card";
export type GreetingCardShareFormat = "square" | "portrait" | "story";
export type GreetingCardTemplate = "royal" | "champagne" | "midnight" | "pearl";
export type SystemLanguage = "id" | "en";
export type AiraGenerationKind = "image" | "pdf" | "word" | "powerpoint" | "excel" | "markdown" | "text";
export type AiraImageQuality = "medium" | "high";
export const AIRAX_GENERATED_RESULTS_MAX = 200;
export const AIRAX_GENERATED_RESULTS_RETENTION_DAYS = 90;
export const AIRAX_GENERATION_ACTIVITY_MAX = 25;

export type Wallet = {
  id: string;
  name: string;
  kind: WalletKind;
  openingBalance: number;
  accountNumber?: string;
  color: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  kind: TransactionKind;
  amount: number;
  walletId: string;
  toWalletId?: string;
  feeAmount?: number;
  category: string;
  note: string;
  /** Nama pengirim untuk pemasukan, atau penerima/tujuan untuk pengeluaran dan transfer. */
  counterpartyName?: string;
  /** Hubungan eksplisit dengan hutang/piutang; hanya boleh berubah setelah transaksi dikonfirmasi. */
  commitmentFlow?: CommitmentTransactionFlow;
  commitmentId?: string;
  /** Metadata dari bukti transaksi atau input pengguna; semua nilai dapat disunting sebelum dikonfirmasi. */
  evidence?: TransactionEvidence;
  occurredAt: string;
  origin: TransactionOrigin;
  status: TransactionStatus;
  proofUri?: string;
  createdAt: string;
};

export type TransactionEvidence = {
  paymentMethod?: TransactionPaymentMethod;
  sourceBankName?: string;
  destinationBankName?: string;
  senderAccountName?: string;
  recipientAccountName?: string;
  senderAccountNumber?: string;
  recipientAccountNumber?: string;
  referenceNumber?: string;
  merchantName?: string;
  /** Dasar klasifikasi berbasis OCR atau data dompet lokal, bukan data akun lain. */
  classificationBasis?: "ocr_text" | "wallet_destination" | "wallet_source" | "wallet_internal";
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  period: "monthly";
  alertAt: number;
  dueAt?: string;
  reminderAt?: string;
  createdAt: string;
};

export type SavingsGoal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  reminderAt?: string;
  color: string;
  createdAt: string;
};

export type CommitmentKind = "bill" | "debt" | "receivable" | "reminder";

export type Commitment = {
  id: string;
  kind: CommitmentKind;
  title: string;
  amount?: number;
  dueDayOfMonth?: number;
  dueTime?: string;
  reminderDayOfMonth?: number;
  reminderTime?: string;
  dueAt?: string;
  reminderAt?: string;
  installmentMonths?: number;
  /** Jumlah bulan cicilan atau tagihan berjangka yang masih tersisa. */
  remainingInstallmentMonths?: number;
  counterparty?: string;
  remainingAmount?: number;
  isRecurring: boolean;
  recurrence?: "monthly" | "weekly";
  isDone: boolean;
  createdAt: string;
};

export type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  source?: string;
  enabled: boolean;
  modeScopes?: AiraResponseMode[];
  createdAt: string;
};

export type InstructionItem = {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  modeScopes?: AiraResponseMode[];
  createdAt: string;
};

export type ChatAttachmentInfo = {
  uri: string;
  kind: "image" | "audio" | "video" | "document";
  mimeType: string;
  label: string;
  /** Diisi pada hasil buatan Aira agar prompt asal dapat digunakan kembali. */
  generationPrompt?: string;
  generationKind?: AiraGenerationKind;
  /** Resolusi yang dipilih ketika hasil gambar dibuat. */
  generationQuality?: AiraImageQuality;
};

/** Riwayat hasil buatan Aira yang tersimpan secara lokal pada scope akun aktif. */
export type AiraGeneratedResult = {
  id: string;
  uri: string;
  kind: "image" | "document";
  mimeType: string;
  label: string;
  prompt: string;
  generationKind: AiraGenerationKind;
  quality?: AiraImageQuality;
  isFavorite?: boolean;
  collectionIds?: string[];
  createdAt: string;
};

export type AiraGeneratedResultCollection = {
  id: string;
  name: string;
  accentColor?: string;
  createdAt: string;
};

export type AiraGenerationActivity = {
  id: string;
  label: string;
  kind: AiraGenerationKind;
  status: "completed" | "failed";
  durationMs: number;
  createdAt: string;
  prompt: string;
};

export type AiraGenerationQueueItem = {
  id: string;
  kind: AiraGenerationKind;
  prompt: string;
  quality?: AiraImageQuality;
  createdAt: string;
  attempts: number;
};

export type ChatMemorySuggestion = {
  kind: "knowledge" | "instruction";
  title: string;
  content: string;
  reason: string;
};

export type AiraExpertResponse = {
  id: "general" | "religion" | "medical" | "psychology" | "philosophy" | "law" | "finance" | "technology" | "education" | "business";
  label: string;
  specialty: string;
};

export type AiraChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  attachment?: ChatAttachmentInfo;
  suggestedMemory?: ChatMemorySuggestion;
  expert?: AiraExpertResponse;
};

export type AiraConversation = {
  id: string;
  title: string;
  messages: AiraChatMessage[];
  createdAt: string;
  updatedAt: string;
  /** Mode yang memiliki percakapan ini; riwayat lama tanpa nilai dimigrasikan ke Aira Default. */
  mode?: AiraResponseMode;
  isPrivate?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  /** Waktu dipindah ke sampah. Data dibersihkan setelah 30 hari. */
  deletedAt?: string;
};

export type SmartFinanceCadence = "monthly" | "weekly" | "daily";

/** Sumber pemasukan dapat terhubung ke anggota keluarga, tetapi tetap mendukung data rencana lama. */
export type SmartFinanceIncome = {
  id: string;
  label: string;
  amount: number;
  cadence?: SmartFinanceCadence;
  memberId?: string;
  kind?: "main" | "spouse" | "additional" | "other";
};

export type SmartFinanceItem = {
  id: string;
  title: string;
  category?: string;
  subcategory?: string;
  detail?: string;
  brand?: string;
  quantity?: number;
  unit?: string;
  purchaseDate?: string;
  meterReading?: string;
  voltage?: string;
  tariffType?: "subsidi" | "non_subsidi" | "unknown";
  amount: number;
  cadence: SmartFinanceCadence;
  isPaid: boolean;
  reminderEnabled: boolean;
};

/**
 * Relasi lengkap untuk perencana rumah tangga. Nilai lama dipertahankan agar
 * data yang sudah tersimpan sebelum pembaruan tetap dapat dibuka.
 */
export type SmartFinanceMemberRelation =
  | "self"
  | "spouse"
  | "child"
  | "parent"
  | "other"
  | "husband"
  | "wife"
  | "nephew"
  | "niece"
  | "sibling"
  | "cousin"
  | "father"
  | "mother"
  | "uncle"
  | "aunt"
  | "grandfather"
  | "grandmother";

export type SmartFinanceDietPattern = "seimbang" | "rendah_gula" | "tinggi_protein" | "vegetarian" | "halal" | "lainnya";
export type SmartFinanceMemberActivity = "working" | "student" | "college" | "home" | "retired" | "other";
export type SmartFinanceResidence = "with_family" | "boarding" | "rented" | "own_home" | "other";
export type SmartFinanceTransportMode = "walking" | "bicycle" | "motorcycle" | "car" | "public_transport" | "online_transport" | "other";

export type SmartFinancePeriodicAmount = {
  amount?: number;
  cadence?: SmartFinanceCadence;
};

export type SmartFinanceCommute = {
  mode?: SmartFinanceTransportMode;
  routeLabel?: string;
  distanceKm?: number;
  tripsPerDay?: number;
  daysPerWeek?: number;
  costPerTrip?: number;
  comparisonMode?: SmartFinanceTransportMode;
  comparisonCostPerTrip?: number;
  fuelBudget?: SmartFinancePeriodicAmount;
  maintenanceBudget?: SmartFinancePeriodicAmount;
  lastServiceDate?: string;
  nextServiceDate?: string;
  parkingBudget?: SmartFinancePeriodicAmount;
};

export type SmartFinanceWorkProfile = {
  workplace?: string;
  employmentStatus?: "full_time" | "part_time" | "freelance" | "shift" | "other";
  shiftLabel?: string;
  scheduleLabel?: string;
  hoursPerDay?: number;
  commute?: SmartFinanceCommute;
  mealArrangement?: "bring_from_home" | "buy" | "mixed" | "other";
  mealBudget?: SmartFinancePeriodicAmount;
  snackBudget?: SmartFinancePeriodicAmount;
  recurringWorkCost?: SmartFinancePeriodicAmount;
  quotaGb?: number;
  quotaBudget?: SmartFinancePeriodicAmount;
  otherCost?: SmartFinancePeriodicAmount;
};

export type SmartFinanceStudyProfile = {
  institution?: string;
  educationLevel?: "school" | "college" | "course" | "other";
  scheduleLabel?: string;
  commute?: SmartFinanceCommute;
  mealAllowance?: SmartFinancePeriodicAmount;
  snackAllowance?: SmartFinancePeriodicAmount;
  recurringEducationCost?: SmartFinancePeriodicAmount;
  quotaGb?: number;
  quotaBudget?: SmartFinancePeriodicAmount;
  otherCost?: SmartFinancePeriodicAmount;
};

export type SmartFinanceMemberPlanner = {
  residence?: SmartFinanceResidence;
  residenceLabel?: string;
  residenceCost?: SmartFinancePeriodicAmount;
  work?: SmartFinanceWorkProfile;
  study?: SmartFinanceStudyProfile;
};

export type SmartFinanceMember = {
  id: string;
  relation: SmartFinanceMemberRelation;
  /** Label versi lama; gunakan name untuk data baru. */
  label: string;
  name?: string;
  ageYears: number;
  ageMonths?: number;
  heightCm?: number;
  weightKg?: number;
  dietPattern?: SmartFinanceDietPattern;
  allergies?: string;
  activity?: SmartFinanceMemberActivity;
  planner?: SmartFinanceMemberPlanner;
};

export type SmartFinanceTransport = {
  mode: "angkot" | "motor" | "mobil" | "online" | "other";
  tripsPerDay: number;
  daysPerWeek: number;
  costPerTrip: number;
};

export type SmartFinancePersonalExpense = {
  id: string;
  memberId: string;
  title: string;
  category: "residence" | "transport" | "vehicle_service" | "parking" | "meal" | "snack" | "work" | "education" | "quota" | "other";
  amount: number;
  cadence: SmartFinanceCadence;
  quantity?: number;
  unit?: string;
  notes?: string;
};

export type SmartFinanceSharedExpenseCategory = "rice" | "cooking_oil" | "spices" | "gas" | "protein" | "vegetables" | "water" | "wifi" | "electricity" | "tv_subscription" | "other_bill" | "other";

export type SmartFinanceSharedExpense = {
  id: string;
  title: string;
  category: SmartFinanceSharedExpenseCategory;
  amount: number;
  cadence: SmartFinanceCadence;
  quantity?: number;
  unit?: string;
  /** Harga target hemat untuk jumlah dan periode yang sama; selalu berasal dari input pengguna. */
  targetAmount?: number;
  notes?: string;
};

export type SmartFinancePlan = {
  monthKey: string;
  /** Pemasukan utama legacy. Data baru sebaiknya memakai incomeSources. */
  income: number;
  otherIncome?: SmartFinanceIncome[];
  members?: SmartFinanceMember[];
  riceSacks5kg?: number;
  transport?: SmartFinanceTransport;
  items: SmartFinanceItem[];
  /** Menandai struktur perencana rumah tangga baru tanpa memutus data versi lama. */
  analysisVersion?: 2;
  incomeSources?: SmartFinanceIncome[];
  personalExpenses?: SmartFinancePersonalExpense[];
  sharedExpenses?: SmartFinanceSharedExpense[];
  updatedAt: string;
};

export type AiraProfile = {
  mode: "guest" | "account";
  displayName?: string;
  username?: string;
  bio?: string;
  featuredPhotoUris?: string[];
  userAvatarUri?: string;
  /** Alias kompatibilitas untuk data profil versi lama. Gunakan userAvatarUri pada fitur baru. */
  avatarUri?: string;
  preferredLanguage: string;
  systemLanguage: SystemLanguage;
  voice: "female" | "male";
  airaAvatarUri?: string;
  personalInstruction: string;
  instructionItems: InstructionItem[];
  aiMode: AiraResponseMode;
  aiPersona: string;
  syncEnabled: boolean;
  generationNotificationsEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  prayerReminderEnabled: boolean;
  prayerAlarmTone: "device_default" | "custom_audio";
  prayerAlarmCustomToneUri?: string;
  prayerAlarmCustomToneName?: string;
  prayerAlarmVibrationEnabled: boolean;
  prayerCalculationMethod?: number;
  prayerLocation?: { latitude: number; longitude: number; label?: string; updatedAt: string; source?: "gps" | "last_known" | "manual"; accuracyMeters?: number; timezone?: string; scheduleDate?: string; scheduleUpdatedAt?: string; calculationMethod?: number };
  smartFinancePlan?: SmartFinancePlan;
  uiPreferences: { homeHeadline: string; showRealtimeClock: boolean; compactHome: boolean; prayerTimesVisible?: boolean; greetingCardEnabled?: boolean; greetingCardIntervalSeconds?: number; greetingCardEffect?: GreetingCardEffect; greetingCardAnimation?: GreetingCardAnimation; greetingCardShareFormat?: GreetingCardShareFormat; greetingCardTemplate?: GreetingCardTemplate; showAiraHeroCard?: boolean; showGreetingHeroCard?: boolean; showReminderHeroCard?: boolean; showPrayerHeroCard?: boolean; showWeatherHeroCard?: boolean; colorVisionMode: "standard" | "accessible"; modeAccentColors?: Partial<Record<AiraResponseMode, string>>; modeHeroDetails?: Partial<Record<AiraResponseMode, string>>; spcaEnabled: boolean; spcaPosition: { left: number; top: number }; spcaIconSize?: number; spcaScalePercent: number; spcaTransparencyPercent: number; spcaFloatIntensity?: "subtle" | "standard" | "expressive"; spcaAuraColor?: "cyan" | "violet" | "rose" | "gold"; spcaAuraEnabled?: boolean; spcaAnimationSpeed?: "slow" | "normal" | "fast"; spcaBubblePosition?: "auto" | "left" | "right"; spcaBubbleAnimationEnabled?: boolean; spcaAutoPatrol: boolean; spcaPatrolIntervalSeconds: number; spcaPatrolDurationSeconds: number; spcaReminderBubbleEnabled: boolean; spcaBubbleDurationSeconds: number; spcaBubbleRepeatMinutes: number; spcaPassivePatrolEnabled?: boolean; spcaPassiveIntervalSeconds?: number; spcaPassiveDurationSeconds?: number; spcaPassiveMessages?: [string, string, string]; quickActionOrder: string[]; quickPlanOrder: string[] };
  developerMode: boolean;
};

export type FinanceState = {
  version: 1;
  profile: AiraProfile;
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  commitments: Commitment[];
  knowledgeItems: KnowledgeItem[];
  conversations: AiraConversation[];
  generatedResults: AiraGeneratedResult[];
  generatedResultCollections?: AiraGeneratedResultCollection[];
  generationActivities?: AiraGenerationActivity[];
  generationQueue?: AiraGenerationQueueItem[];
  lastUpdatedAt: string;
};

export type TransactionInput = Omit<Transaction, "id" | "status" | "createdAt">;

export const DEFAULT_PROFILE: AiraProfile = {
  mode: "guest",
  bio: "",
  featuredPhotoUris: [],
  preferredLanguage: "id",
  systemLanguage: "id",
  voice: "female",
  personalInstruction: "Bantu saya secara ramah, praktis, dan jelaskan sebelum menyimpan data keuangan.",
  instructionItems: [],
  aiMode: "aira",
  aiPersona: "",
  syncEnabled: false,
  generationNotificationsEnabled: true,
  dailyReminderEnabled: false,
  dailyReminderHour: 20,
  dailyReminderMinute: 0,
  prayerReminderEnabled: false,
  prayerAlarmTone: "device_default",
  prayerAlarmVibrationEnabled: true,
  prayerCalculationMethod: 20,
  uiPreferences: { homeHeadline: "Ada yang bisa Aira bantu hari ini?", showRealtimeClock: true, compactHome: false, prayerTimesVisible: true, greetingCardEnabled: true, greetingCardIntervalSeconds: 10, greetingCardEffect: "text", greetingCardAnimation: "slide", greetingCardShareFormat: "story", greetingCardTemplate: "royal", colorVisionMode: "standard", spcaEnabled: false, spcaPosition: { left: 12, top: 140 }, spcaIconSize: 54, spcaScalePercent: 25, spcaTransparencyPercent: 100, spcaFloatIntensity: "standard", spcaAuraColor: "cyan", spcaAuraEnabled: true, spcaAnimationSpeed: "normal", spcaBubblePosition: "auto", spcaBubbleAnimationEnabled: true, spcaAutoPatrol: true, spcaPatrolIntervalSeconds: 10, spcaPatrolDurationSeconds: 5, spcaReminderBubbleEnabled: true, spcaBubbleDurationSeconds: 3, spcaBubbleRepeatMinutes: 5, spcaPassivePatrolEnabled: true, spcaPassiveIntervalSeconds: 60, spcaPassiveDurationSeconds: 15, spcaPassiveMessages: ["Ga nyampe lama", "Bentar doang", "Udah di usilin aja\n-_-"] as [string, string, string], quickActionOrder: ["chat", "add", "scan", "prayer", "calculator", "report"], quickPlanOrder: ["smart", "budget", "goal", "bill", "debt", "receivable"] },
  developerMode: false,
};

export const EMPTY_FINANCE_STATE: FinanceState = {
  version: 1,
  profile: DEFAULT_PROFILE,
  wallets: [],
  transactions: [],
  budgets: [],
  goals: [],
  commitments: [],
  knowledgeItems: [],
  conversations: [],
  generatedResults: [],
  generatedResultCollections: [],
  generationActivities: [],
  generationQueue: [],
  lastUpdatedAt: new Date(0).toISOString(),
};
