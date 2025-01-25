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

describe('PUT /api/schools/[id]/policies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update policies information successfully', async () => {
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
      policies_privacy_policy_en: 'Privacy Policy',
      policies_privacy_policy_jp: 'プライバシーポリシー',
      policies_terms_of_use_en: 'Terms of Use',
      policies_terms_of_use_jp: '利用規約',
    });

    const validData = {
      policies_privacy_policy_en: 'Privacy Policy',
      policies_privacy_policy_jp: 'プライバシーポリシー',
      policies_terms_of_use_en: 'Terms of Use',
      policies_terms_of_use_jp: '利用規約',
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/policies', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Policies information updated successfully');
    expect(responseData.school.policies_privacy_policy_en).toBe('Privacy Policy');
    expect(responseData.school.policies_terms_of_use_en).toBe('Terms of Use');
  });

  it('should handle null values correctly', async () => {
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
      policies_privacy_policy_en: '',
      policies_privacy_policy_jp: '',
      policies_terms_of_use_en: '',
      policies_terms_of_use_jp: '',
    });

    const dataWithNulls = {
      policies_privacy_policy_en: null,
      policies_privacy_policy_jp: null,
      policies_terms_of_use_en: null,
      policies_terms_of_use_jp: null,
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/policies', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.school.policies_privacy_policy_en).toBe('');
    expect(responseData.school.policies_terms_of_use_en).toBe('');
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/policies', {
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
      policies_privacy_policy_en: ['not-a-string'],
      policies_terms_of_use_en: 123,
    };

    const request = new NextRequest('http://localhost:3000/api/schools/1/policies', {
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

    const request = new NextRequest('http://localhost:3000/api/schools/1/policies', {
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

    const request = new NextRequest('http://localhost:3000/api/schools/1/policies', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await PUT(request);
    expect(response.status).toBe(403);
  });
});
