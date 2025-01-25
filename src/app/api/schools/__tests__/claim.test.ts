import { NextRequest } from 'next/server';
import { POST } from '../[id]/claim/route';
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
      findMany: jest.fn().mockResolvedValue([]),
    },
    school: {
      findUnique: jest.fn(),
    },
    schoolClaim: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest.fn().mockResolvedValue([]),
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

  it('should create a pending claim successfully', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      email: 'test@example.com',
    });
    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      name_en: 'Test School',
      claims: [],
    });
    (prisma.schoolClaim.create as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'PENDING',
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'DOCUMENT',
        verificationData: 'https://document-url.com',
        notes: 'Test claim',
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
    });
    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      name_en: 'Test School',
      claims: [{ status: 'PENDING' }],
    });

    const request = new NextRequest('http://localhost:3000/api/schools/1/claim', {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'DOCUMENT',
        verificationData: 'https://document-url.com',
      }),
    });

    const response = await POST(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('You already have a pending claim for this school');
  });
});
