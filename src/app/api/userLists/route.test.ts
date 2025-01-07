import { GET } from './route';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    userList: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          user_id: 1,
          schools: [
            { id: 1, name: 'Test School' }
          ]
        }
      ])
    }
  }))
}));

describe('GET /api/userLists', () => {
  it('should return 400 if userId is missing', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User ID is required.');
  });

  it('should return user lists when userId is provided', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists?userId=1')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.lists).toHaveLength(1);
    expect(data.lists[0].schools[0].name).toBe('Test School');
  });
});
