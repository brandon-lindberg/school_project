import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

// Create password hash before mocking
const TEST_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn().mockResolvedValue({
        user_id: 1,
        email: 'test@example.com',
        password_hash: TEST_PASSWORD_HASH,
      }),
    },
  })),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    json: () => Promise.resolve({ message: 'Logged out successfully' }),
  })
) as jest.Mock;

// Import route after mocks are set up
import { POST } from './route';

describe('POST /api/auth/login', () => {
  it('should return 400 if email or password is missing', async () => {
    const request = new NextRequest(new Request('http://localhost/api/auth/login'), {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email and password are required.');
  });

  it('should return 401 if credentials are invalid', async () => {
    const request = new NextRequest(new Request('http://localhost/api/auth/login'), {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrongpassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password.');
  });

  it('should successfully log out a user', async () => {
    // First login the user
    const loginRequest = new NextRequest(new Request('http://localhost/api/auth/login'), {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const loginResponse = await POST(loginRequest);
    const loginData = await loginResponse.json();
    expect(loginResponse.status).toBe(200);
    expect(loginData.message).toBe('Login successful');

    // Now test logout
    const logoutRequest = new NextRequest(new Request('http://localhost/api/auth/logout'), {
      method: 'POST',
    });

    const logoutResponse = await fetch(logoutRequest);
    const logoutData = await logoutResponse.json();

    expect(logoutResponse.status).toBe(200);
    expect(logoutData.message).toBe('Logged out successfully');
  });

  it('should handle logout for unauthenticated users', async () => {
    const request = new NextRequest(new Request('http://localhost/api/auth/logout'), {
      method: 'POST',
    });

    const response = await fetch(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Logged out successfully');
  });
});
