import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { PATCH as patchAllow } from '@/app/api/applications/[id]/route';
import { GET as getAppMessages, POST as postAppMessage } from '@/app/api/applications/[id]/messages/route';
import { getServerSession } from 'next-auth/next';

// Mock Prisma and NextAuth
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    application: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
    schoolAdmin: { findFirst: jest.fn(), findMany: jest.fn() },
    applicationMessage: { findMany: jest.fn(), create: jest.fn() },
    notification: { create: jest.fn(), createMany: jest.fn() },
  },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));

const prismaMock = prisma as unknown as any;
const getSessionMock = getServerSession as jest.Mock;

describe('PATCH /api/applications/[id] allowCandidateMessages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if unauthorized', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1', { method: 'PATCH' });
    const res = await patchAllow(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid application ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com', id: '1' } });
    const req = new NextRequest('http://localhost/api/applications/abc', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowCandidateMessages: true })
    });
    const res = await patchAllow(req as any, { params: Promise.resolve({ id: 'abc' }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid application ID');
  });

  it('returns 404 if application not found', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com', id: '1' } });
    prismaMock.application.findUnique.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowCandidateMessages: true })
    });
    const res = await patchAllow(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Application not found');
  });

  it('returns 403 if user is not admin or assigner', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com', id: '2' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, jobPosting: { schoolId: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    prismaMock.schoolAdmin.findFirst.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowCandidateMessages: true })
    });
    const res = await patchAllow(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(403);
  });

  it('updates allowCandidateMessages on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com', id: '2' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, jobPosting: { schoolId: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SCHOOL_ADMIN' });
    prismaMock.schoolAdmin.findFirst.mockResolvedValue({});
    const updatedApp = { id: 1, allowCandidateMessages: true };
    prismaMock.application.update.mockResolvedValue(updatedApp);
    const req = new NextRequest('http://localhost/api/applications/1', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowCandidateMessages: true })
    });
    const res = await patchAllow(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.allowCandidateMessages).toBe(true);
  });
});

describe('GET /api/applications/[id]/messages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if unauthorized', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'GET' });
    const res = await getAppMessages(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid application ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'c@d.com', id: '1' } });
    const req = new NextRequest('http://localhost/api/applications/abc/messages', { method: 'GET' });
    const res = await getAppMessages(req as any, { params: Promise.resolve({ id: 'abc' }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid application ID');
  });

  it('returns 403 if not admin or owner', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@e.com', id: '2' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, userId: 1, jobPosting: { schoolId: 1 }, user: { user_id: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    prismaMock.schoolAdmin.findFirst.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'GET' });
    const res = await getAppMessages(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(403);
  });

  it('lists messages for owner', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@e.com', id: '1' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, userId: 1, jobPosting: { schoolId: 1 }, user: { user_id: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    prismaMock.schoolAdmin.findFirst.mockResolvedValue(null);
    const fakeMsgs = [{ id: 1, applicationId: 1, senderId: 1, content: 'hi', createdAt: new Date().toISOString(), sender: { user_id: 1, first_name: 'A', family_name: 'B' } }];
    prismaMock.applicationMessage.findMany.mockResolvedValue(fakeMsgs);
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'GET' });
    const res = await getAppMessages(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(fakeMsgs);
  });
});

describe('POST /api/applications/[id]/messages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if unauthorized', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'POST' });
    const res = await postAppMessage(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid application ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@e.com', id: '1' } });
    const req = new NextRequest('http://localhost/api/applications/abc/messages', { method: 'POST' });
    const res = await postAppMessage(req as any, { params: Promise.resolve({ id: 'abc' }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid application ID');
  });

  it('returns 404 if application not found', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@e.com', id: '1' } });
    prismaMock.application.findUnique.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'POST' });
    const res = await postAppMessage(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Application not found');
  });

  it('returns 403 if candidate messaging disabled', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@e.com', id: '2' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, userId: 2, allowCandidateMessages: false, jobPosting: { schoolId: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'hello' }) });
    const res = await postAppMessage(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Candidate communication not allowed');
  });

  it('creates message and notifies admin for candidate', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'u@e.com', id: '2' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, userId: 2, allowCandidateMessages: true, jobPosting: { schoolId: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const fakeMsg = { id: 1, applicationId: 1, senderId: 2, content: 'hi', createdAt: new Date().toISOString(), sender: { user_id: 2, first_name: null, family_name: null } };
    prismaMock.applicationMessage.create.mockResolvedValue(fakeMsg);
    prismaMock.schoolAdmin.findMany.mockResolvedValue([{ user_id: 3 }]);
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'hi' }) });
    const res = await postAppMessage(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(fakeMsg);
    expect(prismaMock.applicationMessage.create).toHaveBeenCalled();
    expect(prismaMock.notification.createMany).toHaveBeenCalled();
  });

  it('creates message and notifies candidate for admin', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@e.com', id: '1' } });
    prismaMock.application.findUnique.mockResolvedValue({ id: 1, userId: 2, allowCandidateMessages: false, jobPosting: { schoolId: 1 } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const fakeMsg = { id: 2, applicationId: 1, senderId: 1, content: 'hello', createdAt: new Date().toISOString(), sender: { user_id: 1, first_name: null, family_name: null } };
    prismaMock.applicationMessage.create.mockResolvedValue(fakeMsg);
    prismaMock.notification.create.mockResolvedValue({});
    const req = new NextRequest('http://localhost/api/applications/1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'hello' }) });
    const res = await postAppMessage(req as any, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(fakeMsg);
    expect(prismaMock.applicationMessage.create).toHaveBeenCalled();
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });
});
