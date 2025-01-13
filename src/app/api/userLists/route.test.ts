import { GET, POST, DELETE } from './route';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Mock the PrismaClient constructor first
jest.mock('@prisma/client', () => {
  const mPrisma = {
    userList: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userListSchools: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

beforeEach(() => {
  jest.clearAllMocks();

  // Set up default mock implementations
  (prisma.userList.findMany as jest.Mock).mockResolvedValue([
    {
      list_id: 1,
      user_id: 1,
      list_name: 'My Schools',
      schools: [{ id: 1, name: 'Test School' }],
    },
  ]);

  (prisma.userList.findFirst as jest.Mock).mockResolvedValue({
    list_id: 1,
    user_id: 1,
    list_name: 'My Schools',
    schools: [{ id: 1, name: 'Test School' }],
  });

  (prisma.userList.create as jest.Mock).mockResolvedValue({
    list_id: 1,
    user_id: 1,
    list_name: 'My Schools',
    schools: [{ id: 1, name: 'Test School' }],
  });

  (prisma.userListSchools.create as jest.Mock).mockResolvedValue({
    list_id: 1,
    school_id: 1,
  });

  (prisma.userListSchools.delete as jest.Mock).mockResolvedValue({
    list_id: 1,
    school_id: 1,
  });
});

describe('GET /api/userLists', () => {
  it('should return 400 if userId is missing', async () => {
    const request = new NextRequest(new Request('http://localhost/api/userLists'));

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User ID is required.');
  });

  it('should return user lists when userId is provided', async () => {
    const request = new NextRequest(new Request('http://localhost/api/userLists?userId=1'));

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
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User ID and School ID are required.');
  });

  it('should create a new list if listId is not provided', async () => {
    (prisma.userList.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest(
      new Request('http://localhost/api/userLists', {
        method: 'POST',
        body: JSON.stringify({ userId: 1, schoolId: 1 }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should add school to existing list if listId is provided', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists', {
        method: 'POST',
        body: JSON.stringify({ userId: 1, schoolId: 1, listId: 1 }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.userList).toHaveProperty('list_id', 1);
  });
});

describe('DELETE /api/userLists', () => {
  it('should return 400 if listId or schoolId is missing', async () => {
    const request = new NextRequest(new Request('http://localhost/api/userLists'));

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('List ID and School ID are required.');
  });

  it('should successfully delete a school from a list', async () => {
    const request = new NextRequest(
      new Request('http://localhost/api/userLists?listId=1&schoolId=1')
    );

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle deletion errors gracefully', async () => {
    (prisma.userListSchools.delete as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    const request = new NextRequest(
      new Request('http://localhost/api/userLists?listId=1&schoolId=1')
    );

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Database error');
  });
});
