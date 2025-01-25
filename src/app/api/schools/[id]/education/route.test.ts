import { NextRequest } from 'next/server';
import { PUT } from './route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

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

describe('PUT /api/schools/[id]/education', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update education information successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@school.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'admin@school.com',
      role: 'SUPER_ADMIN',
      managedSchools: [],
    });

    const validData = {
      education_programs_offered_en: ['Program 1', 'Program 2'],
      education_programs_offered_jp: ['プログラム1', 'プログラム2'],
      education_curriculum_en: 'Curriculum',
      education_curriculum_jp: 'カリキュラム',
      education_academic_support_en: ['Support 1'],
      education_academic_support_jp: ['サポート1'],
      education_extracurricular_activities_en: ['Activity 1'],
      education_extracurricular_activities_jp: ['アクティビティ1'],
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/education', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Education information updated successfully');
    expect(prisma.school.update).toHaveBeenCalledWith({
      where: { school_id: 1 },
      data: expect.objectContaining(validData),
    });
  });

  it('should handle null values and empty arrays correctly', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@school.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'admin@school.com',
      role: 'SUPER_ADMIN',
      managedSchools: [],
    });

    const dataWithNulls = {
      education_programs_offered_en: null,
      education_programs_offered_jp: [],
      education_curriculum_en: null,
      education_curriculum_jp: '',
      education_academic_support_en: ['', null, undefined],
      education_academic_support_jp: null,
      education_extracurricular_activities_en: null,
      education_extracurricular_activities_jp: null,
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/education', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);

    // Verify that arrays are empty and strings are empty strings
    expect(prisma.school.update).toHaveBeenCalledWith({
      where: { school_id: 1 },
      data: expect.objectContaining({
        education_programs_offered_en: [],
        education_programs_offered_jp: [],
        education_curriculum_en: '',
        education_curriculum_jp: '',
        education_academic_support_en: [],
        education_academic_support_jp: [],
        education_extracurricular_activities_en: [],
        education_extracurricular_activities_jp: [],
      }),
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/education', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(prisma.school.update).not.toHaveBeenCalled();
  });

  it('should return 404 if user is not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@school.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/education', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
    expect(prisma.school.update).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid data types', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@school.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'admin@school.com',
      role: 'SUPER_ADMIN',
      managedSchools: [],
    });

    const invalidData = {
      education_programs_offered_en: 'not an array',
      education_curriculum_en: 123,
      education_academic_support_en: { not: 'an array' },
      education_extracurricular_activities_en: true,
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/education', {
      method: 'PUT',
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
    expect(prisma.school.update).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not authorized to edit the school', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'user@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      role: 'USER',
      managedSchools: [],
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/education', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Not authorized to edit this school');
    expect(prisma.school.update).not.toHaveBeenCalled();
  });
});
