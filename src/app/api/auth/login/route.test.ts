import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/login', () => {
  it('should return 400 if email or password is missing', async () => {
    const request = new NextRequest(new Request('http://localhost/api/auth/login'), {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email and password are required.');
  });

  it('should return 401 if credentials are invalid', async () => {
    const request = new NextRequest(new Request('http://localhost/api/auth/login'), {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrongpassword' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password.');
  });

  // Add more tests as needed
});
