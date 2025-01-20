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
    school: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    schoolClaim: {
      create: jest.fn(),
      update: jest.fn(),
    },
    schoolAdmin: {
      create: jest.fn(),
    },
  },
}));

describe('POST /api/schools/[id]/claim', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new Request('http://localhost/api/schools/1/claim'), {
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

  it('should create a pending claim for document verification', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'user@example.com' },
    });

    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      claims: [],
    });

    (prisma.schoolClaim.create as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'PENDING',
    });

    const request = new NextRequest(new Request('http://localhost/api/schools/1/claim'), {
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

  it('should auto-approve claim for matching email domain', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'user@school.edu' },
    });

    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      claims: [],
    });

    (prisma.schoolClaim.create as jest.Mock).mockResolvedValue({
      claim_id: 1,
      status: 'PENDING',
    });

    const request = new NextRequest(new Request('http://localhost/api/schools/1/claim'), {
      method: 'POST',
      body: JSON.stringify({
        verificationMethod: 'EMAIL',
        verificationData: 'school.edu',
      }),
    });

    const response = await POST(request, { params: { id: '1' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('APPROVED');
    expect(prisma.schoolClaim.update).toHaveBeenCalled();
    expect(prisma.school.update).toHaveBeenCalled();
    expect(prisma.schoolAdmin.create).toHaveBeenCalled();
  });

  it('should prevent duplicate pending claims', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'user@example.com' },
    });

    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
      claims: [{ status: 'PENDING' }],
    });

    const request = new NextRequest(new Request('http://localhost/api/schools/1/claim'), {
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
