import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const admissionsSchema = z
  .object({
    admissions_acceptance_policy_en: z.string().nullable().default(''),
    admissions_acceptance_policy_jp: z.string().nullable().default(''),
    admissions_application_guidelines_en: z.string().nullable().default(''),
    admissions_application_guidelines_jp: z.string().nullable().default(''),
    admissions_age_requirements_en: z.string().nullable().default(''),
    admissions_age_requirements_jp: z.string().nullable().default(''),
    admissions_fees_en: z.string().nullable().default(''),
    admissions_fees_jp: z.string().nullable().default(''),
    admissions_procedure_en: z.string().nullable().default(''),
    admissions_procedure_jp: z.string().nullable().default(''),
    admissions_language_requirements_students_en: z.string().nullable().default(''),
    admissions_language_requirements_students_jp: z.string().nullable().default(''),
    admissions_language_requirements_parents_en: z.string().nullable().default(''),
    admissions_language_requirements_parents_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_application_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_application_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_day_care_fee_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_day_care_fee_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_day_care_fee_registration_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_day_care_fee_registration_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_day_care_fee_maintenance_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_day_care_fee_maintenance_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_kindergarten_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_kindergarten_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_kindergarten_registration_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_kindergarten_registration_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_kindergarten_maintenance_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_kindergarten_maintenance_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_elementary_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_elementary_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_elementary_registration_fee_en: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_elementary_registration_fee_jp: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_elementary_maintenance_fee_en: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_elementary_maintenance_fee_jp: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_junior_high_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_junior_high_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_junior_high_registration_fee_en: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_junior_high_registration_fee_jp: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_en: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_high_school_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_high_school_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_grade_high_school_registration_fee_en: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_high_school_registration_fee_jp: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_high_school_maintenance_fee_en: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_grade_high_school_maintenance_fee_jp: z
      .string()
      .nullable()
      .default(''),
    admissions_breakdown_fees_summer_school_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_summer_school_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_summer_school_registration_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_summer_school_registration_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_summer_school_maintenance_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_summer_school_maintenance_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_other_tuition_en: z.string().nullable().default(''),
    admissions_breakdown_fees_other_tuition_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_other_registration_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_other_registration_fee_jp: z.string().nullable().default(''),
    admissions_breakdown_fees_other_maintenance_fee_en: z.string().nullable().default(''),
    admissions_breakdown_fees_other_maintenance_fee_jp: z.string().nullable().default(''),
  })
  .partial();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const schoolId = params.id;

    if (!schoolId) {
      return NextResponse.json({ error: 'Invalid school ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        managedSchools: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const school = await prisma.school.findUnique({
      where: { school_id: schoolId },
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }
    const validatedData = admissionsSchema.parse(body);

    const processedData = {
      ...validatedData,
    };

    await prisma.school.update({
      where: { school_id: schoolId },
      data: processedData,
    });

    return NextResponse.json(
      { message: 'Admissions information updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update admissions information' }, { status: 500 });
  }
}
