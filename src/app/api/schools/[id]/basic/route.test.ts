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

describe('PUT /api/schools/[id]/basic', () => {
  const validData = {
    name_en: 'International School Tokyo',
    name_jp: 'インターナショナルスクール東京',
    short_description_en: 'A leading international school in Tokyo',
    short_description_jp: '東京の一流インターナショナルスクール',
    description_en: 'Detailed description of the school',
    description_jp: '学校の詳細な説明',
    location_en: 'Tokyo',
    location_jp: '東京',
    country_en: 'Japan',
    country_jp: '日本',
    region_en: 'Kanto',
    region_jp: '関東',
    geography_en: 'Central Tokyo',
    geography_jp: '東京中心部',
    phone_en: '+81-3-1234-5678',
    phone_jp: '03-1234-5678',
    email_en: 'info@school.com',
    email_jp: 'info@school.com',
    address_en: '1-1-1 Shibuya, Shibuya-ku, Tokyo',
    address_jp: '東京都渋谷区渋谷1-1-1',
    url_en: 'https://school.com/en',
    url_jp: 'https://school.com/jp',
    logo_id: 'logo123',
    image_id: 'image123',
    affiliations_en: ['IB World School', 'WASC'],
    affiliations_jp: ['IBワールドスクール', 'WASC'],
    accreditation_en: ['CIS', 'NEASC'],
    accreditation_jp: ['CIS', 'NEASC'],
    staff_staff_list_en: ['John Smith - Principal', 'Jane Doe - Vice Principal'],
    staff_staff_list_jp: ['ジョン・スミス - 校長', 'ジェーン・ドウ - 副校長'],
    staff_board_members_en: ['Board Member 1', 'Board Member 2'],
    staff_board_members_jp: ['理事1', '理事2'],
  };

  const dataWithNulls = {
    name_en: 'International School Tokyo',
    name_jp: null,
    short_description_en: null,
    short_description_jp: null,
    description_en: null,
    description_jp: null,
    location_en: null,
    location_jp: null,
    country_en: null,
    country_jp: null,
    region_en: null,
    region_jp: null,
    geography_en: null,
    geography_jp: null,
    phone_en: null,
    phone_jp: null,
    email_en: null,
    email_jp: null,
    address_en: null,
    address_jp: null,
    url_en: null,
    url_jp: null,
    logo_id: null,
    image_id: null,
    affiliations_en: null,
    affiliations_jp: null,
    accreditation_en: null,
    accreditation_jp: null,
    staff_staff_list_en: null,
    staff_staff_list_jp: null,
    staff_board_members_en: null,
    staff_board_members_jp: null,
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
    (prisma.school.update as jest.Mock).mockResolvedValue({
      school_id: 1,
      ...validData,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/basic', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(401);
  });

  it('should return 404 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/schools/1/basic', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(404);
  });

  it('should successfully update basic information with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/basic', {
      method: 'PUT',
      body: JSON.stringify(validData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.message).toBe('Basic information updated successfully');
  });

  it('should handle null values correctly', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools/1/basic', {
      method: 'PUT',
      body: JSON.stringify(dataWithNulls),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(200);
  });

  it('should return 400 if name_en is missing', async () => {
    const invalidData = { ...validData, name_en: '' };
    const request = new NextRequest('http://localhost:3000/api/schools/1/basic', {
      method: 'PUT',
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(400);
  });

  it('should return 400 if URLs are invalid', async () => {
    const invalidData = {
      ...validData,
      url_en: 'not-a-url',
      url_jp: 'also-not-a-url',
    };
    const request = new NextRequest('http://localhost:3000/api/schools/1/basic', {
      method: 'PUT',
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request, { params: { id: '1' } });
    expect(response.status).toBe(400);
  });
});
