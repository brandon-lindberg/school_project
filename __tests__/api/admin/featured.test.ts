import { GET as getSlots, POST as createSlot } from '@/app/api/admin/featured/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// Mock Prisma and NextAuth
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    featuredSlot: { findMany: jest.fn(), create: jest.fn() },
  },
}));
jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));

const prismaMock = prisma as unknown as any;
const getSessionMock = getServerSession as jest.Mock;

describe('GET /api/admin/featured', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns 401 if not authenticated', async () => {
    getSessionMock.mockResolvedValue(null);
    const res = await getSlots();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Not authenticated');
  });

  it('returns 403 if not SUPER_ADMIN', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const res = await getSlots();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Not authorized');
  });

  it('returns slots on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const now = new Date().toISOString();
    const slots = [{ id: 1, slotNumber: 1, school: { school_id: '2' }, startDate: now, endDate: now }];
    prismaMock.featuredSlot.findMany.mockResolvedValue(slots);
    const res = await getSlots();
    expect(prismaMock.featuredSlot.findMany).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(slots);
  });
});

describe('POST /api/admin/featured', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns 401 if not authenticated', async () => {
    getSessionMock.mockResolvedValue(null);
    const req = new Request('http://localhost/api/admin/featured', { method: 'POST' });
    const res = await createSlot(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 if not SUPER_ADMIN', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'USER' });
    const req = new Request('http://localhost/api/admin/featured', { method: 'POST' });
    const res = await createSlot(req as any);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid data', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const req = new Request('http://localhost/api/admin/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotNumber: '5', schoolId: 'x', startDate: '2025-01-10', endDate: '2025-01-09' }),
    });
    const res = await createSlot(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request data');
  });

  it('creates slot on success', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'admin@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });
    const fakeSlot = { id: 10, slotNumber: 2, school: { school_id: '3' }, startDate: '2025-01-01', endDate: '2025-01-02' };
    prismaMock.featuredSlot.create.mockResolvedValue(fakeSlot);
    const req = new Request('http://localhost/api/admin/featured', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotNumber: '2', schoolId: '3', startDate: '2025-01-01', endDate: '2025-01-02' }),
    });
    const res = await createSlot(req as any);
    expect(prismaMock.featuredSlot.create).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(fakeSlot);
  });
});
