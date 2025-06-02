import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST as createApplication } from '@/app/api/job-postings/[id]/applications/route';
import { GET as listApplications } from '@/app/api/schools/[id]/recruitment/applications/route';
import { getServerSession } from 'next-auth/next';

// Mock Prisma and NextAuth
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    application: { create: jest.fn(), findMany: jest.fn() },
    notification: { create: jest.fn() },
  },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));

const prismaMock = prisma as unknown as {
  user: { findUnique: jest.Mock; findMany: jest.Mock };
  application: { create: jest.Mock; findMany: jest.Mock };
  notification: { create: jest.Mock };
};
const getSessionMock = getServerSession as jest.Mock;

describe('Application Submission API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if unauthorized', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/job-postings/1/applications', { method: 'POST' });
    const res = await createApplication(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid job ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@example.com', id: '1' } });
    const req = new NextRequest('http://localhost/api/job-postings/abc/applications', { method: 'POST' });
    const res = await createApplication(req as any, { params: Promise.resolve({ id: 'abc' }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid job posting ID');
  });

  it('creates an application on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@example.com', id: '1' } });
    const createdAt = new Date().toISOString();
    const fakeApp = {
      id: 1,
      jobPostingId: 1,
      userId: '1',
      applicantName: 'Jane',
      email: 'jane@e.com',
      hasJapaneseVisa: false,
      certifications: [],
      degrees: [],
      currentResidence: null,
      nationality: null,
      resumeUrl: null,
      coverLetter: null,
      status: 'APPLIED',
      currentStage: 'SCREENING',
      submittedAt: createdAt,
    };
    prismaMock.application.create.mockResolvedValue(fakeApp);
    const payload = { applicantName: 'Jane', email: 'jane@e.com' };
    const req = new NextRequest('http://localhost/api/job-postings/1/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res = await createApplication(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('application');
    expect(body.application.id).toBe(1);
    expect(prismaMock.application.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ jobPostingId: 1, userId: '1', applicantName: 'Jane', email: 'jane@e.com' }) })
    );
  });
});

describe('Application Listing API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if unauthorized', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/schools/1/recruitment/applications', { method: 'GET' });
    const res = await listApplications(req as any, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  it('lists applications on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@e.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ email: 'admin@e.com', role: 'SUPER_ADMIN', managedSchools: [] });
    const submittedAt = new Date().toISOString();
    const fakeApps = [{ id: 1, jobPostingId: 1, userId: '1', applicantName: 'Jane', email: 'jane@e.com', notes: [], offer: null, interviews: [], submittedAt }];
    prismaMock.application.findMany.mockResolvedValue(fakeApps);
    const req = new NextRequest('http://localhost/api/schools/1/recruitment/applications', { method: 'GET' });
    const res = await listApplications(req as any, { params: { id: '1' } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(fakeApps);
  });
});
