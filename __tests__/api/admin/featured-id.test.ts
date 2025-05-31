import { NextRequest } from 'next/server';
import { GET as getSlot, PUT as updateSlot, DELETE as deleteSlot } from '@/app/api/admin/featured/[id]/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// Mock Prisma and NextAuth
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    featuredSlot: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));

const prismaMock = prisma as unknown as any;
const getSessionMock = getServerSession as jest.Mock;

describe('GET /api/admin/featured/[id]', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns 401 if not authenticated', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'GET' });
    const res = await getSlot(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Not authenticated');
  });

  it('returns 403 if not SUPER_ADMIN', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'GET' });
    const res = await getSlot(req as any);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Not authorized');
  });

  it('returns 400 for invalid slot ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = new NextRequest('http://localhost/api/admin/featured/abc', { method: 'GET' });
    const res = await getSlot(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid slot ID');
  });

  it('returns 404 if slot not found', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    prismaMock.featuredSlot.findUnique.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'GET' });
    const res = await getSlot(req as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Featured slot not found');
  });

  it('returns slot on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const testSlot = { id: 1, slotNumber: 1, school: { school_id: '2' }, startDate: '2025-01-01', endDate: '2025-01-02' };
    prismaMock.featuredSlot.findUnique.mockResolvedValue(testSlot);
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'GET' });
    const res = await getSlot(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(testSlot);
  });
});

describe('PUT /api/admin/featured/[id]', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns 401 if not authenticated', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'PUT' });
    const res = await updateSlot(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 if not SUPER_ADMIN', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'PUT' });
    const res = await updateSlot(req as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid slot ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = new NextRequest('http://localhost/api/admin/featured/abc', { method: 'PUT' });
    const res = await updateSlot(req as any);
    expect(res.status).toBe(400);
  });

  it('updates slot on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const body = { slotNumber: '3', schoolId: '4', startDate: '2025-02-01', endDate: '2025-02-05' };
    const updatedSlot = { id: 1, slotNumber: 3, school: { school_id: '4' }, startDate: '2025-02-01', endDate: '2025-02-05' };
    prismaMock.featuredSlot.update.mockResolvedValue(updatedSlot);
    const req = new NextRequest('http://localhost/api/admin/featured/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await updateSlot(req as any);
    expect(prismaMock.featuredSlot.update).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const resBody = await res.json();
    expect(resBody).toEqual(updatedSlot);
  });
});

describe('DELETE /api/admin/featured/[id]', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns 401 if not authenticated', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'DELETE' });
    const res = await deleteSlot(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 if not SUPER_ADMIN', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'DELETE' });
    const res = await deleteSlot(req as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid slot ID', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = new NextRequest('http://localhost/api/admin/featured/abc', { method: 'DELETE' });
    const res = await deleteSlot(req as any);
    expect(res.status).toBe(400);
  });

  it('deletes slot on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    prismaMock.featuredSlot.delete.mockResolvedValue({});
    const req = new NextRequest('http://localhost/api/admin/featured/1', { method: 'DELETE' });
    const res = await deleteSlot(req as any);
    expect(prismaMock.featuredSlot.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
