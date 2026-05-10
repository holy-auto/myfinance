export const ROLES = {
  ADMIN: "ADMIN",
  ACCOUNTANT: "ACCOUNTANT",
  APPROVER: "APPROVER",
  VIEWER: "VIEWER",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  JOURNAL_CREATE: "journal:create",
  JOURNAL_VIEW: "journal:view",
  JOURNAL_APPROVE: "journal:approve",
  ACCOUNT_CREATE: "account:create",
  ACCOUNT_VIEW: "account:view",
  REPORT_VIEW: "report:view",
  DOCUMENT_UPLOAD: "document:upload",
  CLOSING_MANAGE: "closing:manage",
  ADMIN_MANAGE: "admin:manage",
  SETTINGS_VIEW: "settings:view",
  MASTER_MANAGE: "master:manage",
  BUDGET_MANAGE: "budget:manage",
  IMPORT_MANAGE: "import:manage",
  BANK_MANAGE: "bank:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS),
  ACCOUNTANT: [
    PERMISSIONS.JOURNAL_CREATE,
    PERMISSIONS.JOURNAL_VIEW,
    PERMISSIONS.ACCOUNT_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.CLOSING_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.MASTER_MANAGE,
    PERMISSIONS.BUDGET_MANAGE,
    PERMISSIONS.IMPORT_MANAGE,
    PERMISSIONS.BANK_MANAGE,
  ],
  APPROVER: [
    PERMISSIONS.JOURNAL_VIEW,
    PERMISSIONS.JOURNAL_APPROVE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.CLOSING_MANAGE,
  ],
  VIEWER: [
    PERMISSIONS.JOURNAL_VIEW,
    PERMISSIONS.ACCOUNT_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],
};

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/journal": PERMISSIONS.JOURNAL_VIEW,
  "/journal/new": PERMISSIONS.JOURNAL_CREATE,
  "/accounts": PERMISSIONS.ACCOUNT_VIEW,
  "/accounts/new": PERMISSIONS.ACCOUNT_CREATE,
  "/reports": PERMISSIONS.REPORT_VIEW,
  "/closing": PERMISSIONS.CLOSING_MANAGE,
  "/admin": PERMISSIONS.ADMIN_MANAGE,
  "/settings": PERMISSIONS.SETTINGS_VIEW,
  "/counterparties": PERMISSIONS.MASTER_MANAGE,
  "/departments": PERMISSIONS.MASTER_MANAGE,
  "/business-units": PERMISSIONS.MASTER_MANAGE,
  "/projects": PERMISSIONS.MASTER_MANAGE,
  "/journal-rules": PERMISSIONS.MASTER_MANAGE,
  "/import": PERMISSIONS.IMPORT_MANAGE,
  "/bank": PERMISSIONS.BANK_MANAGE,
  "/budget": PERMISSIONS.BUDGET_MANAGE,
  "/attachments": PERMISSIONS.DOCUMENT_UPLOAD,
};

export const COUNTERPARTY_KIND_LABELS: Record<string, string> = {
  CUSTOMER: "得意先",
  VENDOR: "仕入先",
  BOTH: "得意先・仕入先",
  OTHER: "その他",
};

export const BANK_ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: "当座預金",
  SAVINGS: "普通預金",
  CREDIT_CARD: "クレジットカード",
  E_MONEY: "電子マネー",
  CASH: "現金",
};

export const BANK_TX_STATUS_LABELS: Record<string, string> = {
  UNMATCHED: "未突合",
  MATCHED: "突合済み",
  IGNORED: "対象外",
};

export const TAX_KIND_LABELS: Record<string, string> = {
  TAXABLE_SALES: "課税売上",
  TAXABLE_PURCHASE: "課税仕入",
  REDUCED_SALES: "軽減売上",
  REDUCED_PURCHASE: "軽減仕入",
  EXEMPT: "非課税",
  NON_TAXABLE: "不課税",
  OUT_OF_SCOPE: "対象外",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  ASSET: "資産",
  LIABILITY: "負債",
  EQUITY: "純資産",
  REVENUE: "収益",
  EXPENSE: "費用",
};

export const ENTRY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "下書き",
  PENDING_APPROVAL: "承認待ち",
  APPROVED: "承認済み",
  REJECTED: "却下",
  REVERSED: "取消済み",
};
