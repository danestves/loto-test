import { db } from "./index";
import { category, transaction } from "./schema";

async function seed() {
    console.log("🌱 Starting seed...");

    // Create categories
    const categories = await db
        .insert(category)
        .values([
            { name: "Food" },
            { name: "Transportation" },
            { name: "Travel Expenses" },
            { name: "Office Supplies" },
            { name: "Entertainment" },
            { name: "Utilities" },
        ])
        .returning();

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample transactions
    const now = new Date();
    const transactions = await db
        .insert(transaction)
        .values([
            {
                cardLastFour: "1234",
                amount: 45.50,
                categoryId: categories[0].id, // Food
                transactionDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                status: "approved",
            },
            {
                cardLastFour: "5678",
                amount: 25.00,
                categoryId: categories[1].id, // Transportation
                transactionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                status: "approved",
            },
            {
                cardLastFour: "9012",
                amount: 350.00,
                categoryId: categories[2].id, // Travel Expenses
                transactionDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                status: "pending",
            },
            {
                cardLastFour: "3456",
                amount: 89.99,
                categoryId: categories[3].id, // Office Supplies
                transactionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                status: "approved",
            },
            {
                cardLastFour: "7890",
                amount: 120.00,
                categoryId: categories[4].id, // Entertainment
                transactionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
                status: "rejected",
            },
            {
                cardLastFour: "2345",
                amount: 200.00,
                categoryId: categories[5].id, // Utilities
                transactionDate: now,
                status: "pending",
            },
            {
                cardLastFour: "1234",
                amount: 32.50,
                categoryId: categories[0].id, // Food
                transactionDate: now,
                status: "pending",
            },
            {
                cardLastFour: "5678",
                amount: 15.00,
                categoryId: categories[1].id, // Transportation
                transactionDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                status: "approved",
            },
        ])
        .returning();

    console.log(`✅ Created ${transactions.length} transactions`);
    console.log("🌱 Seed completed successfully!");
}

seed()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
