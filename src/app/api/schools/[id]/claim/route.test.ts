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
      findFirst: jest.fn(),
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

    // Default mock for unauthorized case
    (getServerSession as jest.Mock).mockResolvedValue(null);

    // Default mock for non-existent user case
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Default mock for non-existent school case
    (prisma.school.findUnique as jest.Mock).mockResolvedValue(null);

    // Default mock for no existing claims
    (prisma.schoolClaim.findFirst as jest.Mock).mockResolvedValue(null);
  });

  it('should handle unauthorized requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should handle non-existent users', async () => {
    // Mock authenticated session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it('should handle non-existent schools', async () => {
    // Mock authenticated session and existing user
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
    });

    const request = new NextRequest('http://localhost:3000/api/schools/999/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
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
    });
    (prisma.schoolClaim.create as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'PENDING',
    });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ user_id: 2, role: 'SUPER_ADMIN' }]);
    (prisma.$transaction as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request);
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
    });
    (prisma.schoolClaim.findFirst as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'PENDING',
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('You already have a pending claim for this school');
  });
});
