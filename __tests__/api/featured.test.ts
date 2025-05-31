import { GET } from '@/app/api/featured/route';
import prisma from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { featuredSlot: { findMany: jest.fn() } },
}));

const prismaMock = prisma as unknown as any;

describe('GET /api/featured', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns slots on success', async () => {
    const testSlots = [
      { id: 1, slotNumber: 2, school: { school_id: '5', name_en: 'Test School' }, startDate: new Date().toISOString(), endDate: new Date().toISOString() },
    ];
    prismaMock.featuredSlot.findMany.mockResolvedValue(testSlots);
    const req = new Request('http://localhost/api/featured');
    const res = await GET(req as any);
    expect(prismaMock.featuredSlot.findMany).toHaveBeenCalled();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ slots: testSlots });
  });

  it('returns 500 on error', async () => {
    prismaMock.featuredSlot.findMany.mockRejectedValue(new Error('DB failure'));
    const req = new Request('http://localhost/api/featured');
    const res = await GET(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch featured slots');
  });
});
