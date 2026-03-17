const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "StartupFlow Inc.",
      currency: "USD",
    },
  });

  // 2. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@startupflow.com",
      passwordHash,
      role: "ADMIN",
      organizationId: org.id,
    },
  });

  // 3. Create Partners
  const partner1 = await prisma.partner.create({
    data: {
      name: "Alice Partner",
      email: "alice@investor.com",
      organizationId: org.id,
    },
  });

  const partner2 = await prisma.partner.create({
    data: {
      name: "Bob Partner",
      email: "bob@investor.com",
      organizationId: org.id,
    },
  });

  // 4. Create Categories
  const catSoftware = await prisma.category.create({
    data: { name: "Software", organizationId: org.id },
  });
  const catRent = await prisma.category.create({
    data: { name: "Rent", organizationId: org.id },
  });
  const catMarketing = await prisma.category.create({
    data: { name: "Marketing", organizationId: org.id },
  });

  // 5. Create Investments
  await prisma.investment.createMany({
    data: [
      {
        partnerId: partner1.id,
        amount: 50000,
        investmentType: "ONE_TIME",
        investmentDate: new Date("2025-01-15"),
        organizationId: org.id,
      },
      {
        partnerId: partner2.id,
        amount: 30000,
        investmentType: "ONE_TIME",
        investmentDate: new Date("2025-02-10"),
        organizationId: org.id,
      },
      {
        partnerId: partner1.id,
        amount: 2000,
        investmentType: "MONTHLY",
        investmentDate: new Date(),
        organizationId: org.id,
      },
    ],
  });

  // 6. Create Expenses
  await prisma.expense.createMany({
    data: [
      {
        title: "AWS Bill",
        amount: 500,
        expenseDate: new Date(),
        categoryId: catSoftware.id,
        paymentMethod: "Credit Card",
        organizationId: org.id,
      },
      {
        title: "Office Rent",
        amount: 2000,
        expenseDate: new Date(),
        categoryId: catRent.id,
        paymentMethod: "Bank Transfer",
        organizationId: org.id,
      },
      {
        title: "Google Ads",
        amount: 1500,
        expenseDate: new Date(),
        categoryId: catMarketing.id,
        paymentMethod: "Credit Card",
        organizationId: org.id,
      },
      {
        title: "GitHub Subscription",
        amount: 100,
        expenseDate: new Date(),
        categoryId: catSoftware.id,
        paymentMethod: "Credit Card",
        organizationId: org.id,
      },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
