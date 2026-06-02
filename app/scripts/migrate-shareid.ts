import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function generateShareId(): string {
  // Generate a URL-safe random string
  return randomBytes(12).toString("base64url");
}

async function main() {
  console.log("Starting shareId migration...");

  // Update all forms without shareId
  const formsToUpdate = await prisma.form.findMany({
    where: { shareId: null },
    select: { id: true },
  });

  console.log(`Found ${formsToUpdate.length} forms to update`);

  for (const form of formsToUpdate) {
    await prisma.form.update({
      where: { id: form.id },
      data: { shareId: generateShareId() },
    });
  }

  // Update all widgets without shareId
  const widgetsToUpdate = await prisma.widget.findMany({
    where: { shareId: null },
    select: { id: true },
  });

  console.log(`Found ${widgetsToUpdate.length} widgets to update`);

  for (const widget of widgetsToUpdate) {
    await prisma.widget.update({
      where: { id: widget.id },
      data: { shareId: generateShareId() },
    });
  }

  console.log("Migration completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
