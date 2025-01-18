import type { School as PrismaSchool } from '@prisma/client';
import { Language } from '@/utils/language';

// Convert Prisma's null types to undefined and add any additional fields
export type School = {
  [K in keyof PrismaSchool]: PrismaSchool[K] extends null | undefined
    ? PrismaSchool[K] | undefined
    : PrismaSchool[K];
} & {
  // Add specific types for dynamic fee level keys
  [K in `admissions_breakdown_fees_${FeeLevel}_${FeeType}_${Language}`]?: string;
} & {
  school_id: string;
};

export type FeeLevel = 'day_care' | 'elementary' | 'junior_high' | 'high_school';

export type FeeType = 'tuition' | 'registration_fee' | 'maintenance_fee';
