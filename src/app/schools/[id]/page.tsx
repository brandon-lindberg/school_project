import { Metadata, ResolvingMetadata } from 'next';
import { School } from '@/types/school';
import ClientSchoolDetail from '@/app/schools/[id]/ClientSchoolDetail';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getSchool(id: string): Promise<School | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/schools?id=${id}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Response not ok:', await response.text());
      return null;
    }

    const data = await response.json();
    if (!data || !data.school_id) {
      console.error('Invalid school data received:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching school:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const school = await getSchool(resolvedParams.id);

  if (!school) {
    return {
      title: 'School Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  // Filter out null values from arrays and provide fallbacks for null strings
  const keywords = [
    'international school',
    'education',
    school.name_en || '',
    school.country_en || '',
    school.region_en || '',
    ...(school.education_programs_offered_en?.filter(Boolean) || []),
    ...(school.accreditation_en?.filter(Boolean) || []),
  ];

  return {
    title: `${school.name_en || 'School'} - International School Profile`,
    description:
      school.short_description_en || school.description_en || 'International School Profile',
    keywords: keywords,
    openGraph: {
      title: school.name_en || 'International School',
      description:
        school.short_description_en || school.description_en || 'International School Profile',
      url: `${process.env.NEXT_PUBLIC_API_URL}/schools/${school.school_id}`,
      siteName: 'My International Schools',
      images: [
        {
          url: school.image_url || '/logo.png',
          width: 1200,
          height: 630,
          alt: school.name_en || 'School Image',
        },
        ...previousImages,
      ],
      locale: 'en_US',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: school.name_en || 'International School',
      description:
        school.short_description_en || school.description_en || 'International School Profile',
      images: [school.image_url || '/logo.png'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL}/schools/${school.school_id}`,
      languages: {
        'en-US': `${process.env.NEXT_PUBLIC_API_URL}/schools/${school.school_id}?lang=en`,
        'ja-JP': `${process.env.NEXT_PUBLIC_API_URL}/schools/${school.school_id}?lang=jp`,
      },
    },
  };
}

export default async function SchoolDetailPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const school = await getSchool(resolvedParams.id);

  // Get the language from search params
  const language = resolvedSearchParams.lang === 'ja' ? 'jp' : 'en';

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {language === 'jp' ? '学校が見つかりません' : 'School not found'}
        </div>
      </div>
    );
  }

  return <ClientSchoolDetail school={school} />;
}
