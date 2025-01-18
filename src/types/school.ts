import type { School as PrismaSchool } from '@prisma/client';

// Convert Prisma's null types to undefined and add any additional fields
export type School = {
  [K in keyof PrismaSchool]: PrismaSchool[K] extends null | undefined
    ? PrismaSchool[K] | undefined
    : PrismaSchool[K];
} & {
  // Add any additional fields not in Prisma schema
  [key: string]: any; // For dynamic fee level keys
};

export type FeeLevel = 'day_care' | 'elementary' | 'junior_high' | 'high_school';

export type FeeType = 'tuition' | 'registration_fee' | 'maintenance_fee';
