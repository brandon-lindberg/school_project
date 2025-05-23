import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { GET, POST } from '@/app/api/schools/[id]/recruitment/job-postings/route';
import { getServerSession } from 'next-auth/next';

// Mock Prisma and NextAuth session
jest.mock('@/lib/prisma', () => ({
  jobPosting: { findMany: jest.fn(), create: jest.fn() },
  user: { findUnique: jest.fn() },
}));
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

const prismaMock = prisma as unknown as {
  jobPosting: { findMany: jest.Mock; create: jest.Mock };
  user: { findUnique: jest.Mock };
};
const getSessionMock = getServerSession as jest.Mock;

describe('Job Postings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/schools/:id/recruitment/job-postings', () => {
    it('returns 400 if school ID invalid', async () => {
      const req = new NextRequest('http://localhost/api/schools/abc/recruitment/job-postings', { method: 'GET' });
      const res = await GET(req as any, { params: { id: 'abc' } });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Invalid school ID');
    });

    it('returns job postings on success', async () => {
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;
      const fakeJobs = [
        { id: 1, title: 'Dev', description: 'desc', requirements: [], location: 'Tokyo', employmentType: 'FULL_TIME', status: 'OPEN', createdAt, updatedAt, schoolId: 1, applications: [] },
      ];
      prismaMock.jobPosting.findMany.mockResolvedValue(fakeJobs);
      const req = new NextRequest('http://localhost/api/schools/1/recruitment/job-postings', { method: 'GET' });
      const res = await GET(req as any, { params: { id: '1' } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual(fakeJobs);
      expect(prismaMock.jobPosting.findMany).toHaveBeenCalledWith({ where: { schoolId: 1 }, orderBy: { createdAt: 'desc' } });
    });
  });

  describe('POST /api/schools/:id/recruitment/job-postings', () => {
    it('returns 401 if unauthorized', async () => {
      getSessionMock.mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/schools/1/recruitment/job-postings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const res = await POST(req as any, { params: { id: '1' } });
      expect(res.status).toBe(401);
    });

    it('creates job posting on success', async () => {
      getSessionMock.mockResolvedValue({ user: { email: 'admin@example.com' } });
      prismaMock.user.findUnique.mockResolvedValue({ email: 'admin@example.com', role: 'SUPER_ADMIN', managedSchools: [] });
      prismaMock.jobPosting.create.mockResolvedValue({ id: 2, title: 'Test', description: 'desc', requirements: [], location: 'Tokyo', employmentType: 'FULL_TIME', status: 'OPEN', createdAt: new Date(), updatedAt: new Date(), schoolId: 1 });
      const payload = { title: 'Test', description: 'desc', requirements: [], location: 'Tokyo', employmentType: 'FULL_TIME' };
      const req = new NextRequest('http://localhost/api/schools/1/recruitment/job-postings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const res = await POST(req as any, { params: { id: '1' } });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty('id', 2);
      expect(prismaMock.jobPosting.create).toHaveBeenCalledWith({ data: { schoolId: 1, ...payload, status: 'OPEN' } });
    });
  });
});
