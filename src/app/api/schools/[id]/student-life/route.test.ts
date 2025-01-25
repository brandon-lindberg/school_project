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
      update: jest.fn(),
    },
  },
}));

describe('PUT /api/schools/[id]/student-life', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update student life information successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@school.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'admin@school.com',
      role: 'SUPER_ADMIN',
      managedSchools: [],
    });

    (prisma.school.update as jest.Mock).mockResolvedValue({
      school_id: 1,
      student_life_counseling_en: 'Counseling services available',
      student_life_counseling_jp: 'カウンセリングサービスが利用可能',
      student_life_support_services_en: ['Academic Support', 'Career Guidance'],
      student_life_support_services_jp: ['学習支援', 'キャリアガイダンス'],
      student_life_library_en: 'Modern library facilities',
      student_life_library_jp: '現代的な図書館施設',
      student_life_calendar_en: 'Academic calendar 2024',
      student_life_calendar_jp: '2024年度学事暦',
      student_life_tour_en: 'Virtual campus tour',
      student_life_tour_jp: 'バーチャルキャンパスツアー',
    });

    const validData = {
      student_life_counseling_en: 'Counseling services available',
      student_life_counseling_jp: 'カウンセリングサービスが利用可能',
      student_life_support_services_en: ['Academic Support', 'Career Guidance'],
      student_life_support_services_jp: ['学習支援', 'キャリアガイダンス'],
      student_life_library_en: 'Modern library facilities',
      student_life_library_jp: '現代的な図書館施設',
      student_life_calendar_en: 'Academic calendar 2024',
      student_life_calendar_jp: '2024年度学事暦',
      student_life_tour_en: 'Virtual campus tour',
      student_life_tour_jp: 'バーチャルキャンパスツアー',
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/student-life', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Student life information updated successfully');
    expect(responseData.school.student_life_counseling_en).toBe('Counseling services available');
    expect(responseData.school.student_life_support_services_en).toEqual([
      'Academic Support',
      'Career Guidance',
    ]);
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

    (prisma.school.update as jest.Mock).mockResolvedValue({
      school_id: 1,
      student_life_counseling_en: '',
      student_life_counseling_jp: '',
      student_life_support_services_en: [],
      student_life_support_services_jp: [],
      student_life_library_en: '',
      student_life_library_jp: '',
      student_life_calendar_en: '',
      student_life_calendar_jp: '',
      student_life_tour_en: '',
      student_life_tour_jp: '',
    });

    const dataWithNulls = {
      student_life_counseling_en: null,
      student_life_counseling_jp: null,
      student_life_support_services_en: null,
      student_life_support_services_jp: [],
      student_life_library_en: null,
      student_life_library_jp: null,
      student_life_calendar_en: null,
      student_life_calendar_jp: null,
      student_life_tour_en: null,
      student_life_tour_jp: null,
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/student-life', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.school.student_life_counseling_en).toBe('');
    expect(responseData.school.student_life_support_services_en).toEqual([]);
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/student-life', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(401);
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
      student_life_counseling_en: ['not-a-string'],
      student_life_support_services_en: 'not-an-array',
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/student-life', {
      method: 'PUT',
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it('should return 404 if user is not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@school.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/student-life', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(404);
  });

  it('should return 403 if user is not authorized to edit the school', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'user@school.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'user@school.com',
      role: 'USER',
      managedSchools: [],
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/student-life', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(403);
  });
});
