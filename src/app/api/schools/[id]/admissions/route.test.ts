import { NextRequest } from 'next/server';
import { PUT } from './route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    school: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PUT /api/schools/[id]/admissions', () => {
  const validData = {
    admissions_acceptance_policy_en: 'We accept students from diverse backgrounds',
    admissions_acceptance_policy_jp: '多様な背景を持つ生徒を受け入れています',
    admissions_application_guidelines_en: 'Please submit all required documents',
    admissions_application_guidelines_jp: '必要書類をすべて提出してください',
    admissions_age_requirements_en: 'Students must be 5-18 years old',
    admissions_age_requirements_jp: '生徒は5歳から18歳までである必要があります',
    admissions_fees_en: 'Please see the breakdown below',
    admissions_fees_jp: '詳細は以下をご覧ください',
    admissions_procedure_en: 'Application process takes 2-3 weeks',
    admissions_procedure_jp: '出願手続きには2-3週間かかります',
    admissions_language_requirements_students_en: 'Minimum TOEFL score of 80',
    admissions_language_requirements_students_jp: 'TOEFLスコア80以上が必要',
    admissions_language_requirements_parents_en: 'Basic English communication',
    admissions_language_requirements_parents_jp: '基本的な英語でのコミュニケーション',
    admissions_breakdown_fees_application_fee_en: '¥20,000',
    admissions_breakdown_fees_application_fee_jp: '20,000円',
    admissions_breakdown_fees_day_care_fee_tuition_en: '¥50,000/month',
    admissions_breakdown_fees_day_care_fee_tuition_jp: '50,000円/月',
    admissions_breakdown_fees_day_care_fee_registration_fee_en: '¥100,000',
    admissions_breakdown_fees_day_care_fee_registration_fee_jp: '100,000円',
    admissions_breakdown_fees_day_care_fee_maintenance_fee_en: '¥10,000/month',
    admissions_breakdown_fees_day_care_fee_maintenance_fee_jp: '10,000円/月',
    admissions_breakdown_fees_kindergarten_tuition_en: '¥60,000/month',
    admissions_breakdown_fees_kindergarten_tuition_jp: '60,000円/月',
    admissions_breakdown_fees_kindergarten_registration_fee_en: '¥150,000',
    admissions_breakdown_fees_kindergarten_registration_fee_jp: '150,000円',
    admissions_breakdown_fees_kindergarten_maintenance_fee_en: '¥12,000/month',
    admissions_breakdown_fees_kindergarten_maintenance_fee_jp: '12,000円/月',
    admissions_breakdown_fees_grade_elementary_tuition_en: '¥70,000/month',
    admissions_breakdown_fees_grade_elementary_tuition_jp: '70,000円/月',
    admissions_breakdown_fees_grade_elementary_registration_fee_en: '¥200,000',
    admissions_breakdown_fees_grade_elementary_registration_fee_jp: '200,000円',
    admissions_breakdown_fees_grade_elementary_maintenance_fee_en: '¥15,000/month',
    admissions_breakdown_fees_grade_elementary_maintenance_fee_jp: '15,000円/月',
    admissions_breakdown_fees_grade_junior_high_tuition_en: '¥80,000/month',
    admissions_breakdown_fees_grade_junior_high_tuition_jp: '80,000円/月',
    admissions_breakdown_fees_grade_junior_high_registration_fee_en: '¥250,000',
    admissions_breakdown_fees_grade_junior_high_registration_fee_jp: '250,000円',
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_en: '¥18,000/month',
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp: '18,000円/月',
    admissions_breakdown_fees_grade_high_school_tuition_en: '¥90,000/month',
    admissions_breakdown_fees_grade_high_school_tuition_jp: '90,000円/月',
    admissions_breakdown_fees_grade_high_school_registration_fee_en: '¥300,000',
    admissions_breakdown_fees_grade_high_school_registration_fee_jp: '300,000円',
    admissions_breakdown_fees_grade_high_school_maintenance_fee_en: '¥20,000/month',
    admissions_breakdown_fees_grade_high_school_maintenance_fee_jp: '20,000円/月',
    admissions_breakdown_fees_summer_school_tuition_en: '¥40,000/month',
    admissions_breakdown_fees_summer_school_tuition_jp: '40,000円/月',
    admissions_breakdown_fees_summer_school_registration_fee_en: '¥50,000',
    admissions_breakdown_fees_summer_school_registration_fee_jp: '50,000円',
    admissions_breakdown_fees_summer_school_maintenance_fee_en: '¥8,000/month',
    admissions_breakdown_fees_summer_school_maintenance_fee_jp: '8,000円/月',
    admissions_breakdown_fees_other_tuition_en: '¥30,000/month',
    admissions_breakdown_fees_other_tuition_jp: '30,000円/月',
    admissions_breakdown_fees_other_registration_fee_en: '¥40,000',
    admissions_breakdown_fees_other_registration_fee_jp: '40,000円',
    admissions_breakdown_fees_other_maintenance_fee_en: '¥5,000/month',
    admissions_breakdown_fees_other_maintenance_fee_jp: '5,000円/月',
  };

  const dataWithNulls = {
    admissions_acceptance_policy_en: null,
    admissions_acceptance_policy_jp: null,
    admissions_application_guidelines_en: null,
    admissions_application_guidelines_jp: null,
    admissions_age_requirements_en: null,
    admissions_age_requirements_jp: null,
    admissions_fees_en: null,
    admissions_fees_jp: null,
    admissions_procedure_en: null,
    admissions_procedure_jp: null,
    admissions_language_requirements_students_en: null,
    admissions_language_requirements_students_jp: null,
    admissions_language_requirements_parents_en: null,
    admissions_language_requirements_parents_jp: null,
    admissions_breakdown_fees_application_fee_en: null,
    admissions_breakdown_fees_application_fee_jp: null,
    admissions_breakdown_fees_day_care_fee_tuition_en: null,
    admissions_breakdown_fees_day_care_fee_tuition_jp: null,
    admissions_breakdown_fees_day_care_fee_registration_fee_en: null,
    admissions_breakdown_fees_day_care_fee_registration_fee_jp: null,
    admissions_breakdown_fees_day_care_fee_maintenance_fee_en: null,
    admissions_breakdown_fees_day_care_fee_maintenance_fee_jp: null,
    admissions_breakdown_fees_kindergarten_tuition_en: null,
    admissions_breakdown_fees_kindergarten_tuition_jp: null,
    admissions_breakdown_fees_kindergarten_registration_fee_en: null,
    admissions_breakdown_fees_kindergarten_registration_fee_jp: null,
    admissions_breakdown_fees_kindergarten_maintenance_fee_en: null,
    admissions_breakdown_fees_kindergarten_maintenance_fee_jp: null,
    admissions_breakdown_fees_grade_elementary_tuition_en: null,
    admissions_breakdown_fees_grade_elementary_tuition_jp: null,
    admissions_breakdown_fees_grade_elementary_registration_fee_en: null,
    admissions_breakdown_fees_grade_elementary_registration_fee_jp: null,
    admissions_breakdown_fees_grade_elementary_maintenance_fee_en: null,
    admissions_breakdown_fees_grade_elementary_maintenance_fee_jp: null,
    admissions_breakdown_fees_grade_junior_high_tuition_en: null,
    admissions_breakdown_fees_grade_junior_high_tuition_jp: null,
    admissions_breakdown_fees_grade_junior_high_registration_fee_en: null,
    admissions_breakdown_fees_grade_junior_high_registration_fee_jp: null,
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_en: null,
    admissions_breakdown_fees_grade_junior_high_maintenance_fee_jp: null,
    admissions_breakdown_fees_grade_high_school_tuition_en: null,
    admissions_breakdown_fees_grade_high_school_tuition_jp: null,
    admissions_breakdown_fees_grade_high_school_registration_fee_en: null,
    admissions_breakdown_fees_grade_high_school_registration_fee_jp: null,
    admissions_breakdown_fees_grade_high_school_maintenance_fee_en: null,
    admissions_breakdown_fees_grade_high_school_maintenance_fee_jp: null,
    admissions_breakdown_fees_summer_school_tuition_en: null,
    admissions_breakdown_fees_summer_school_tuition_jp: null,
    admissions_breakdown_fees_summer_school_registration_fee_en: null,
    admissions_breakdown_fees_summer_school_registration_fee_jp: null,
    admissions_breakdown_fees_summer_school_maintenance_fee_en: null,
    admissions_breakdown_fees_summer_school_maintenance_fee_jp: null,
    admissions_breakdown_fees_other_tuition_en: null,
    admissions_breakdown_fees_other_tuition_jp: null,
    admissions_breakdown_fees_other_registration_fee_en: null,
    admissions_breakdown_fees_other_registration_fee_jp: null,
    admissions_breakdown_fees_other_maintenance_fee_en: null,
    admissions_breakdown_fees_other_maintenance_fee_jp: null,
  };

  const invalidData = {
    admissions_acceptance_policy_en: 123,
    admissions_application_guidelines_en: true,
    admissions_age_requirements_en: [],
    admissions_language_requirements_students_en: {},
    admissions_language_requirements_parents_en: 456,
    admissions_application_fee_en: 'not a number',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      managedSchools: [],
    });
    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
    });
    (prisma.school.update as jest.Mock).mockResolvedValue({
      school_id: 1,
      ...validData,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/admissions', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    expect(response.status).toBe(401);
  });

  it('should return 404 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/admissions', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    expect(response.status).toBe(404);
  });

  it('should update admissions information successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/admissions', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.message).toBe('Admissions information updated successfully');
  });

  it('should handle null values correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/admissions', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);
  });

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/admissions', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it('should handle invalid data types', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/admissions', {
      method: 'PUT',
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });
});
