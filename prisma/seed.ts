// @ts-expect-error - seed script runs outside of Next.js context
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "システム管理者",
      permissions: [
        "journal:create",
        "journal:view",
        "journal:approve",
        "account:create",
        "account:view",
        "report:view",
        "document:upload",
        "closing:manage",
        "admin:manage",
        "settings:view",
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: "ACCOUNTANT" },
    update: {},
    create: {
      name: "ACCOUNTANT",
      description: "経理担当",
      permissions: [
        "journal:create",
        "journal:view",
        "account:view",
        "report:view",
        "document:upload",
        "closing:manage",
        "settings:view",
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: "APPROVER" },
    update: {},
    create: {
      name: "APPROVER",
      description: "承認者",
      permissions: [
        "journal:view",
        "journal:approve",
        "report:view",
        "closing:manage",
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: "VIEWER" },
    update: {},
    create: {
      name: "VIEWER",
      description: "閲覧者",
      permissions: ["journal:view", "account:view", "report:view"],
    },
  });

  // Create admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@myfinance.local" },
    update: {},
    create: {
      email: "admin@myfinance.local",
      name: "管理者",
      passwordHash,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  // Create standard chart of accounts (Japanese standard)
  const accounts = [
    // Assets (1xxx)
    { code: "1000", name: "流動資産", type: "ASSET" as const, normalBalance: "DEBIT" as const, isSummary: true, level: 0 },
    { code: "1100", name: "現金", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1110", name: "普通預金", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1120", name: "当座預金", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1200", name: "売掛金", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1300", name: "棚卸資産", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1400", name: "前払費用", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1500", name: "仮払金", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1900", name: "固定資産", type: "ASSET" as const, normalBalance: "DEBIT" as const, isSummary: true, level: 0 },
    { code: "1910", name: "建物", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1920", name: "車両運搬具", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1930", name: "工具器具備品", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "1950", name: "ソフトウェア", type: "ASSET" as const, normalBalance: "DEBIT" as const, level: 1 },
    // Liabilities (2xxx)
    { code: "2000", name: "流動負債", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, isSummary: true, level: 0 },
    { code: "2100", name: "買掛金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2200", name: "未払金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2300", name: "未払費用", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2400", name: "前受金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2500", name: "預り金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2600", name: "仮受金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2700", name: "短期借入金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "2900", name: "固定負債", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, isSummary: true, level: 0 },
    { code: "2910", name: "長期借入金", type: "LIABILITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    // Equity (3xxx)
    { code: "3000", name: "純資産", type: "EQUITY" as const, normalBalance: "CREDIT" as const, isSummary: true, level: 0 },
    { code: "3100", name: "資本金", type: "EQUITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "3200", name: "資本準備金", type: "EQUITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "3300", name: "利益剰余金", type: "EQUITY" as const, normalBalance: "CREDIT" as const, level: 1 },
    // Revenue (4xxx)
    { code: "4000", name: "売上高", type: "REVENUE" as const, normalBalance: "CREDIT" as const, isSummary: true, level: 0 },
    { code: "4100", name: "売上", type: "REVENUE" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "4200", name: "受取利息", type: "REVENUE" as const, normalBalance: "CREDIT" as const, level: 1 },
    { code: "4300", name: "雑収入", type: "REVENUE" as const, normalBalance: "CREDIT" as const, level: 1 },
    // Expenses (5xxx-8xxx)
    { code: "5000", name: "売上原価", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, isSummary: true, level: 0 },
    { code: "5100", name: "仕入", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "5200", name: "外注費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6000", name: "販売費及び一般管理費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, isSummary: true, level: 0 },
    { code: "6100", name: "役員報酬", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6110", name: "給料手当", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6120", name: "法定福利費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6200", name: "旅費交通費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6210", name: "通信費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6220", name: "消耗品費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6230", name: "水道光熱費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6240", name: "地代家賃", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6250", name: "保険料", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6260", name: "租税公課", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6270", name: "減価償却費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6280", name: "支払手数料", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6290", name: "広告宣伝費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6300", name: "接待交際費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "6400", name: "雑費", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "7000", name: "営業外費用", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, isSummary: true, level: 0 },
    { code: "7100", name: "支払利息", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
    { code: "7200", name: "雑損失", type: "EXPENSE" as const, normalBalance: "DEBIT" as const, level: 1 },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: {
        code: account.code,
        name: account.name,
        type: account.type,
        normalBalance: account.normalBalance,
        isSummary: account.isSummary ?? false,
        level: account.level,
      },
    });
  }

  console.log("Seed completed successfully");
  console.log(`- Roles: 4`);
  console.log(`- Admin user: admin@myfinance.local / admin123`);
  console.log(`- Accounts: ${accounts.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
