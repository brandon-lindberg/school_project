import { NextRequest } from 'next/server';
import { GET, PUT } from './route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

// Mock next-auth
jest.mock('next-auth/next', () => ({
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
  },
}));

describe('User Preferences API', () => {
  const mockSession = {
    user: { email: 'test@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/user/preferences', () => {
    it('should return user preferences when authenticated', async () => {
      const mockUser = {
        preferred_view_mode: 'grid',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ preferred_view_mode: 'grid' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { preferred_view_mode: true },
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'User not authenticated' });
    });

    it('should return 404 when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });
  });

  describe('PUT /api/user/preferences', () => {
    const mockRequest = (body: { preferred_view_mode?: string }) =>
      new NextRequest('http://localhost', {
        method: 'PUT',
        body: JSON.stringify(body),
      });

    it('should update user preferences when authenticated', async () => {
      const mockUser = {
        preferred_view_mode: 'grid',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const response = await PUT(mockRequest({ preferred_view_mode: 'grid' }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ preferred_view_mode: 'grid' });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { preferred_view_mode: 'grid' },
        select: { preferred_view_mode: true },
      });
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await PUT(mockRequest({ preferred_view_mode: 'grid' }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'User not authenticated' });
    });

    it('should return 400 for invalid view mode', async () => {
      const response = await PUT(mockRequest({ preferred_view_mode: 'invalid' }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid view mode' });
    });
  });
});
