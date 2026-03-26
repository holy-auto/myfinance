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
