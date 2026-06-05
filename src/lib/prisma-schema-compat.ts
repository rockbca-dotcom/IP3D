import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type InformationSchemaColumnRow = {
  column_name: string;
};

export function isSchemaCompatibilityError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

export async function withSchemaCompatibilityFallback<T>(
  operation: () => Promise<T>,
  fallbackValue: T
) {
  try {
    return await operation();
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      return fallbackValue;
    }
    throw error;
  }
}

export async function getTableColumns(tableName: string) {
  const rows = await prisma.$queryRawUnsafe<InformationSchemaColumnRow[]>(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
    `,
    tableName
  );

  return new Set(rows.map((row) => row.column_name));
}

export function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}
