import type { School as PrismaSchool } from '@prisma/client';

// Convert Prisma's null types to undefined
export type School = {
  [K in keyof PrismaSchool]: PrismaSchool[K] extends null | undefined
    ? PrismaSchool[K] | undefined
    : PrismaSchool[K];
};
