import { NextRequest } from 'next/server';
import { PUT } from './route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    school: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('PUT /api/schools/[id]/campus', () => {
  const validData = {
    campus_facilities_en: ['Library', 'Cafeteria'],
    campus_facilities_jp: ['図書館', '食堂'],
    campus_virtual_tour_en: 'https://example.com/tour',
    campus_virtual_tour_jp: 'https://example.com/tour/jp',
  };

  const dataWithNulls = {
    ...validData,
    campus_virtual_tour_en: null,
    campus_virtual_tour_jp: null,
    campus_facilities_en: null,
    campus_facilities_jp: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
      managedSchools: [],
    });
    (prisma.school.findUnique as jest.Mock).mockResolvedValue({
      school_id: 1,
    });
    (prisma.school.update as jest.Mock).mockImplementation(({ data }) => ({
      school_id: 1,
      ...data,
      campus_virtual_tour_en: data.campus_virtual_tour_en || '',
      campus_virtual_tour_jp: data.campus_virtual_tour_jp || '',
      campus_facilities_en: data.campus_facilities_en || [],
      campus_facilities_jp: data.campus_facilities_jp || [],
    }));
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/campus', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(401);
  });

  it('should return 404 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/campus', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(404);
  });

  it('should successfully update campus information with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/campus', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.message).toBe('Campus information updated successfully');
  });

  it('should handle null values correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/campus', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(200);

    const updateCall = (prisma.school.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.campus_facilities_en).toEqual([]);
    expect(updateCall.data.campus_facilities_jp).toEqual([]);
    expect(updateCall.data.campus_virtual_tour_en).toBe('');
    expect(updateCall.data.campus_virtual_tour_jp).toBe('');
  });
});
