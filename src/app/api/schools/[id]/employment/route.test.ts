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

describe('PUT /api/schools/[id]/employment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update employment information successfully', async () => {
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
      employment_open_positions_en: ['Teacher', 'Administrator'],
      employment_open_positions_jp: ['教師', '管理者'],
      employment_application_process_en: 'Submit your resume and cover letter',
      employment_application_process_jp: '履歴書とカバーレターを提出してください',
    });

    const validData = {
      employment_open_positions_en: ['Teacher', 'Administrator'],
      employment_open_positions_jp: ['教師', '管理者'],
      employment_application_process_en: 'Submit your resume and cover letter',
      employment_application_process_jp: '履歴書とカバーレターを提出してください',
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/employment', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Employment information updated successfully');
    expect(responseData.school.employment_open_positions_en).toEqual(['Teacher', 'Administrator']);
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
      employment_open_positions_en: [],
      employment_open_positions_jp: [],
      employment_application_process_en: '',
      employment_application_process_jp: '',
    });

    const dataWithNulls = {
      employment_open_positions_en: null,
      employment_open_positions_jp: [],
      employment_application_process_en: null,
      employment_application_process_jp: '',
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/employment', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.school.employment_open_positions_en).toEqual([]);
    expect(responseData.school.employment_application_process_en).toBe('');
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/employment', {
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
      employment_open_positions_en: 'not-an-array',
      employment_application_process_en: ['not-a-string'],
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/employment', {
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

    const request = new NextRequest('http://localhost:3000/api/schools/1/employment', {
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

    const request = new NextRequest('http://localhost:3000/api/schools/1/employment', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(403);
  });
});
