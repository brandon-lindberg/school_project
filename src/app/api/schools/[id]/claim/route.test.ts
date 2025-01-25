import { NextRequest } from 'next/server';
import { POST } from './route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    school: {
      findUnique: jest.fn(),
    },
    schoolClaim: {
      create: jest.fn(),
    },
    schoolAdmin: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('POST /api/schools/[id]/claim', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if user is not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request, { params: { id: '1' } });
    expect(response.status).toBe(404);
  });

  it('should return 400 if school ID is invalid', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      family_name: 'User',
    });

    const request = new NextRequest('http://localhost:3000/api/schools/invalid/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request, { params: { id: 'invalid' } });
    expect(response.status).toBe(400);
  });

  it('should create a new claim successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      family_name: 'User',
    });
    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      name_en: 'Test School',
      name_jp: null,
      claims: [],
    });
    (prisma.schoolClaim.create as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'PENDING',
    });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { user_id: 2, role: 'SUPER_ADMIN' },
    ]);
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('PENDING');
    expect(data.claim_id).toBe(1);
  });

  it('should prevent duplicate pending claims', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      family_name: 'User',
    });
    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      name_en: 'Test School',
      name_jp: null,
      claims: [{ status: 'PENDING' }],
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('You already have a pending claim for this school');
  });
});
