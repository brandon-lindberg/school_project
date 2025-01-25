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
      update: jest.fn(),
    },
    schoolClaim: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    school: {
      update: jest.fn(),
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

describe('POST /api/schools/claims/process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new Request('http://localhost/api/schools/claims/process'), {
      method: 'POST',
      body: JSON.stringify({
        claimId: 1,
        status: 'APPROVED',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 if user is not a super admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      role: 'USER',
    });

    const request = new NextRequest(new Request('http://localhost/api/schools/claims/process'), {
      method: 'POST',
      body: JSON.stringify({
        claimId: 1,
        status: 'APPROVED',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Only super admins can process claims');
  });

  it('should approve a claim and create school admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      role: 'SUPER_ADMIN',
    });

    (prisma.schoolClaim.findUnique as jest.Mock).mockResolvedValue({
      claim_id: 1,
      school_id: 1,
      user_id: 2,
      status: 'PENDING',
      school: {
        school_id: 1,
        name_en: 'Test School',
        name_jp: null,
      },
    });

    (prisma.$transaction as jest.Mock).mockResolvedValue([
      { school_id: 1 }, // school update result
      { user_id: 2, school_id: 1 }, // school admin create result
      { user_id: 2, role: 'SCHOOL_ADMIN' }, // user update result
    ]);

    const request = new NextRequest(new Request('http://localhost/api/schools/claims/process'), {
      method: 'POST',
      body: JSON.stringify({
        claimId: 1,
        status: 'APPROVED',
        notes: 'Approved after document verification',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Claim approved and school admin role assigned');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should reject a claim', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      role: 'SUPER_ADMIN',
    });

    (prisma.schoolClaim.findUnique as jest.Mock).mockResolvedValue({
      claim_id: 1,
      school_id: 1,
      user_id: 2,
      status: 'PENDING',
      school: {
        school_id: 1,
        name_en: 'Test School',
        name_jp: null,
      },
    });

    (prisma.schoolClaim.update as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'REJECTED',
    });

    const request = new NextRequest(new Request('http://localhost/api/schools/claims/process'), {
      method: 'POST',
      body: JSON.stringify({
        claimId: 1,
        status: 'REJECTED',
        notes: 'Invalid documentation',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Claim processed successfully');
    expect(data.claim.status).toBe('REJECTED');
  });

  it('should return 404 if claim not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
      role: 'SUPER_ADMIN',
    });

    (prisma.schoolClaim.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new Request('http://localhost/api/schools/claims/process'), {
      method: 'POST',
      body: JSON.stringify({
        claimId: 999,
        status: 'APPROVED',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Claim not found');
  });
});
