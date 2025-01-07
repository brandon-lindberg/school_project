import { GET, POST } from './route';
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
      ]),
      create: jest.fn().mockResolvedValue({
        id: 1,
        list_name: 'My Schools',
        user_id: 1,
        schools: [
          { id: 1, school_id: 1 }
        ]
      })
    },
    userListSchools: {
      create: jest.fn().mockResolvedValue({
        list_id: 1,
        school_id: 1
      })
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

describe('POST /api/userLists', () => {
  it('should return 400 if userId or schoolId is missing', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists', {
        method: 'POST',
        body: JSON.stringify({ userId: 1 }), // Missing schoolId
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User ID and School ID are required.');
  });

  it('should create a new list if listId is not provided', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists', {
        method: 'POST',
        body: JSON.stringify({ userId: 1, schoolId: 1 }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.userList).toHaveProperty('list_name', 'My Schools');
  });

  it('should add school to existing list if listId is provided', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists', {
        method: 'POST',
        body: JSON.stringify({ userId: 1, schoolId: 1, listId: 1 }),
        headers: { 'Content-Type': 'application/json' }
      })
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.userList).toHaveProperty('list_id', 1);
  });
});
