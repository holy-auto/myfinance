// @ts-expect-error - seed script
import { PrismaClient } from "../src/generated/prisma/client.js";
// @ts-expect-error
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:///home/user/webapp/prisma/dev.db" });
const prisma = new PrismaClient({ adapter });
async function main() {
  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "システム管理者",
      permissions: "journal:create,journal:view,journal:approve,account:create,account:view,report:view,document:upload,closing:manage,admin:manage,settings:view",
    },
  });
  await prisma.role.upsert({
    where: { name: "ACCOUNTANT" },
    update: {},
    create: {
      name: "ACCOUNTANT",
      description: "経理担当",
      permissions: "journal:create,journal:view,account:view,report:view,document:upload,closing:manage,settings:view",
    },
  });
  await prisma.role.upsert({
    where: { name: "APPROVER" },
    update: {},
    create: {
      name: "APPROVER",
      description: "承認者",
      permissions: "journal:view,journal:approve,report:view,closing:manage",
    },
  });
  await prisma.role.upsert({
    where: { name: "VIEWER" },
    update: {},
    create: {
      name: "VIEWER",
      description: "閲覧者",
      permissions: "journal:view,account:view,report:view",
    },
  });

  // Admin user
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

  // Chart of accounts
  const accounts = [
    { code: "1000", name: "流動資産", type: "ASSET", normalBalance: "DEBIT", isSummary: true, level: 0 },
    { code: "1100", name: "現金", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1110", name: "普通預金", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1120", name: "当座預金", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1200", name: "売掛金", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1300", name: "棚卸資産", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1400", name: "前払費用", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1500", name: "仮払金", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1900", name: "固定資産", type: "ASSET", normalBalance: "DEBIT", isSummary: true, level: 0 },
    { code: "1910", name: "建物", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1920", name: "車両運搬具", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1930", name: "工具器具備品", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "1950", name: "ソフトウェア", type: "ASSET", normalBalance: "DEBIT", level: 1 },
    { code: "2000", name: "流動負債", type: "LIABILITY", normalBalance: "CREDIT", isSummary: true, level: 0 },
    { code: "2100", name: "買掛金", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "2200", name: "未払金", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "2300", name: "未払費用", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "2400", name: "前受金", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "2500", name: "預り金", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "2700", name: "短期借入金", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "2900", name: "固定負債", type: "LIABILITY", normalBalance: "CREDIT", isSummary: true, level: 0 },
    { code: "2910", name: "長期借入金", type: "LIABILITY", normalBalance: "CREDIT", level: 1 },
    { code: "3000", name: "純資産", type: "EQUITY", normalBalance: "CREDIT", isSummary: true, level: 0 },
    { code: "3100", name: "資本金", type: "EQUITY", normalBalance: "CREDIT", level: 1 },
    { code: "3200", name: "資本準備金", type: "EQUITY", normalBalance: "CREDIT", level: 1 },
    { code: "3300", name: "利益剰余金", type: "EQUITY", normalBalance: "CREDIT", level: 1 },
    { code: "4000", name: "売上高", type: "REVENUE", normalBalance: "CREDIT", isSummary: true, level: 0 },
    { code: "4100", name: "売上", type: "REVENUE", normalBalance: "CREDIT", level: 1 },
    { code: "4200", name: "受取利息", type: "REVENUE", normalBalance: "CREDIT", level: 1 },
    { code: "4300", name: "雑収入", type: "REVENUE", normalBalance: "CREDIT", level: 1 },
    { code: "5000", name: "売上原価", type: "EXPENSE", normalBalance: "DEBIT", isSummary: true, level: 0 },
    { code: "5100", name: "仕入", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "5200", name: "外注費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6000", name: "販売費及び一般管理費", type: "EXPENSE", normalBalance: "DEBIT", isSummary: true, level: 0 },
    { code: "6100", name: "役員報酬", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6110", name: "給料手当", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6120", name: "法定福利費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6200", name: "旅費交通費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6210", name: "通信費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6220", name: "消耗品費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6230", name: "水道光熱費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6240", name: "地代家賃", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6250", name: "保険料", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6260", name: "租税公課", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6270", name: "減価償却費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6280", name: "支払手数料", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6290", name: "広告宣伝費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6300", name: "接待交際費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "6400", name: "雑費", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "7000", name: "営業外費用", type: "EXPENSE", normalBalance: "DEBIT", isSummary: true, level: 0 },
    { code: "7100", name: "支払利息", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
    { code: "7200", name: "雑損失", type: "EXPENSE", normalBalance: "DEBIT", level: 1 },
  ];

  const accountMap: Record<string, string> = {};
  for (const account of accounts) {
    const created = await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: {
        code: account.code,
        name: account.name,
        type: account.type as "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
        normalBalance: account.normalBalance as "DEBIT" | "CREDIT",
        isSummary: account.isSummary ?? false,
        level: account.level,
      },
    });
    accountMap[account.code] = created.id;
  }

  // Sample journal entries (2026 fiscal year)
  const sampleEntries = [
    {
      entryDate: new Date("2026-01-05"),
      description: "売上計上（顧客A）",
      lines: [
        { code: "1200", debit: 1100000, credit: 0 },
        { code: "4100", debit: 0, credit: 1000000 },
        { code: "2300", debit: 0, credit: 100000 },
      ],
    },
    {
      entryDate: new Date("2026-01-10"),
      description: "売上計上（顧客B）",
      lines: [
        { code: "1200", debit: 550000, credit: 0 },
        { code: "4100", debit: 0, credit: 500000 },
        { code: "2300", debit: 0, credit: 50000 },
      ],
    },
    {
      entryDate: new Date("2026-01-15"),
      description: "給与支払（1月分）",
      lines: [
        { code: "6110", debit: 800000, credit: 0 },
        { code: "1110", debit: 0, credit: 800000 },
      ],
    },
    {
      entryDate: new Date("2026-01-20"),
      description: "地代家賃（1月分）",
      lines: [
        { code: "6240", debit: 200000, credit: 0 },
        { code: "1110", debit: 0, credit: 200000 },
      ],
    },
    {
      entryDate: new Date("2026-01-25"),
      description: "売掛金回収（顧客A）",
      lines: [
        { code: "1110", debit: 1100000, credit: 0 },
        { code: "1200", debit: 0, credit: 1100000 },
      ],
    },
    {
      entryDate: new Date("2026-01-31"),
      description: "通信費支払",
      lines: [
        { code: "6210", debit: 50000, credit: 0 },
        { code: "1110", debit: 0, credit: 50000 },
      ],
    },
    {
      entryDate: new Date("2026-02-05"),
      description: "売上計上（顧客C）",
      lines: [
        { code: "1200", debit: 2200000, credit: 0 },
        { code: "4100", debit: 0, credit: 2000000 },
        { code: "2300", debit: 0, credit: 200000 },
      ],
    },
    {
      entryDate: new Date("2026-02-10"),
      description: "外注費支払",
      lines: [
        { code: "5200", debit: 300000, credit: 0 },
        { code: "1110", debit: 0, credit: 300000 },
      ],
    },
    {
      entryDate: new Date("2026-02-15"),
      description: "給与支払（2月分）",
      lines: [
        { code: "6110", debit: 800000, credit: 0 },
        { code: "1110", debit: 0, credit: 800000 },
      ],
    },
    {
      entryDate: new Date("2026-02-20"),
      description: "地代家賃（2月分）",
      lines: [
        { code: "6240", debit: 200000, credit: 0 },
        { code: "1110", debit: 0, credit: 200000 },
      ],
    },
    {
      entryDate: new Date("2026-02-28"),
      description: "広告宣伝費支払",
      lines: [
        { code: "6290", debit: 150000, credit: 0 },
        { code: "1110", debit: 0, credit: 150000 },
      ],
    },
    {
      entryDate: new Date("2026-03-05"),
      description: "売上計上（顧客D）",
      lines: [
        { code: "1200", debit: 1650000, credit: 0 },
        { code: "4100", debit: 0, credit: 1500000 },
        { code: "2300", debit: 0, credit: 150000 },
      ],
    },
    {
      entryDate: new Date("2026-03-10"),
      description: "消耗品費購入",
      lines: [
        { code: "6220", debit: 30000, credit: 0 },
        { code: "1110", debit: 0, credit: 30000 },
      ],
    },
    {
      entryDate: new Date("2026-03-15"),
      description: "給与支払（3月分）",
      lines: [
        { code: "6110", debit: 800000, credit: 0 },
        { code: "1110", debit: 0, credit: 800000 },
      ],
    },
    {
      entryDate: new Date("2026-03-20"),
      description: "地代家賃（3月分）",
      lines: [
        { code: "6240", debit: 200000, credit: 0 },
        { code: "1110", debit: 0, credit: 200000 },
      ],
    },
    {
      entryDate: new Date("2026-03-31"),
      description: "役員報酬（Q1）",
      lines: [
        { code: "6100", debit: 600000, credit: 0 },
        { code: "1110", debit: 0, credit: 600000 },
      ],
    },
  ];

  let seq = 1;
  for (const entry of sampleEntries) {
    const fiscalYear = entry.entryDate.getFullYear();
    const fiscalMonth = entry.entryDate.getMonth() + 1;
    const entryNumber = `JE-${fiscalYear}-${String(seq++).padStart(4, "0")}`;
    const existing = await prisma.journalEntry.findUnique({ where: { entryNumber } });
    if (!existing) {
      await prisma.journalEntry.create({
        data: {
          entryNumber,
          entryDate: entry.entryDate,
          description: entry.description,
          status: "APPROVED",
          fiscalYear,
          fiscalMonth,
          createdById: adminUser.id,
          approvedById: adminUser.id,
          approvedAt: entry.entryDate,
          lines: {
            create: entry.lines.map((l, i) => ({
              accountId: accountMap[l.code],
              debit: l.debit,
              credit: l.credit,
              lineOrder: i,
            })),
          },
        },
      });
    }
  }

  // Opening balance
  const openingEntry = await prisma.journalEntry.findUnique({ where: { entryNumber: "JE-2026-0000" } });
  if (!openingEntry) {
    await prisma.journalEntry.create({
      data: {
        entryNumber: "JE-2026-0000",
        entryDate: new Date("2026-01-01"),
        description: "期首残高",
        status: "APPROVED",
        fiscalYear: 2026,
        fiscalMonth: 1,
        createdById: adminUser.id,
        approvedById: adminUser.id,
        approvedAt: new Date("2026-01-01"),
        lines: {
          create: [
            { accountId: accountMap["1110"], debit: 5000000, credit: 0, lineOrder: 0 },
            { accountId: accountMap["3100"], debit: 0, credit: 5000000, lineOrder: 1 },
          ],
        },
      },
    });
  }

  // Closing periods
  for (const [year, month] of [[2026, 1], [2026, 2]]) {
    await prisma.closingPeriod.upsert({
      where: { fiscalYear_fiscalMonth: { fiscalYear: year, fiscalMonth: month } },
      update: {},
      create: {
        fiscalYear: year,
        fiscalMonth: month,
        status: "CLOSED",
        closedById: adminUser.id,
        closedAt: new Date(`${year}-0${month + 1}-01`),
      },
    });
  }

  console.log("✅ Seed completed");
  console.log("  ログイン: admin@myfinance.local / admin123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
