import { Metadata, ResolvingMetadata } from 'next';
import { School } from '@/types/school';
import ClientSchoolDetail from '@/app/schools/[id]/ClientSchoolDetail';
import Script from 'next/script';

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
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const school = await getSchool(resolvedParams.id);
  const language = resolvedSearchParams?.lang === 'ja' ? 'jp' : 'en';

  if (!school) {
    return {
      title: language === 'jp' ? '学校が見つかりません' : 'School Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const schoolUrl = `${baseUrl}/schools/${school.school_id}`;

  // Enhanced keywords with more relevant terms in both languages
  const keywords = [
    'international school', 'インターナショナルスクール',
    'education', '教育',
    'private school', '私立学校',
    school.name_en || '', school.name_jp || '',
    school.country_en || '', school.country_jp || '',
    school.region_en || '', school.region_jp || '',
    ...(school.education_programs_offered_en?.filter(Boolean) || []),
    ...(school.education_programs_offered_jp?.filter(Boolean) || []),
    ...(school.accreditation_en?.filter(Boolean) || []),
    ...(school.accreditation_jp?.filter(Boolean) || []),
    'international education', '国際教育',
    'school profile', '学校プロフィール',
    'admissions', '入学案内',
    'curriculum', 'カリキュラム',
  ].filter(Boolean);

  const description_en = (school.short_description_en || school.description_en || '')
    .slice(0, 155)
    .trim();
  const description_jp = (school.short_description_jp || school.description_jp || '')
    .slice(0, 155)
    .trim();

  const title_en = `${school.name_en || 'School'} - International School in ${school.country_en || ''} | My International Schools`;
  const title_jp = `${school.name_jp || '学校'} - ${school.country_jp || ''}のインターナショナルスクール | My International Schools`;

  const metadata: Metadata = {
    title: language === 'jp' ? title_jp : title_en,
    description: language === 'jp' ? description_jp : description_en,
    keywords: keywords,
    authors: [{ name: 'My International Schools' }],
    openGraph: {
      title: language === 'jp' ? (school.name_jp || '') : (school.name_en || 'International School'),
      description: language === 'jp' ? description_jp : description_en,
      url: schoolUrl,
      siteName: language === 'jp' ? 'My International Schools - インターナショナルスクール' : 'My International Schools',
      images: [
        {
          url: school.image_url || '/logo.png',
          width: 1200,
          height: 630,
          alt: language === 'jp' ? (school.name_jp || '') : (school.name_en || 'School Image'),
        },
        ...previousImages,
      ],
      locale: language === 'jp' ? 'ja_JP' : 'en_US',
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
      nocache: true,
    },
    twitter: {
      card: 'summary_large_image',
      title: language === 'jp' ? (school.name_jp || '') : (school.name_en || 'International School'),
      description: language === 'jp' ? description_jp : description_en,
      images: [school.image_url || '/logo.png'],
      creator: '@myinternationalschools',
    },
    alternates: {
      canonical: schoolUrl,
      languages: {
        'en-US': `${schoolUrl}?lang=en`,
        'ja-JP': `${schoolUrl}?lang=jp`,
      },
    },
    verification: {
      google: 'your-google-site-verification',
    },
  };

  return metadata;
}

export default async function SchoolDetailPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const school = await getSchool(resolvedParams.id);
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

  // Create structured data for the school with both languages
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: [
      { '@language': 'en', '@value': school.name_en || '' },
      { '@language': 'ja', '@value': school.name_jp || '' },
    ],
    description: [
      { '@language': 'en', '@value': school.short_description_en || school.description_en || '' },
      { '@language': 'ja', '@value': school.short_description_jp || school.description_jp || '' },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: [
        { '@language': 'en', '@value': school.country_en || '' },
        { '@language': 'ja', '@value': school.country_jp || '' },
      ],
      addressRegion: [
        { '@language': 'en', '@value': school.region_en || '' },
        { '@language': 'ja', '@value': school.region_jp || '' },
      ],
      addressLocality: [
        { '@language': 'en', '@value': school.location_en || '' },
        { '@language': 'ja', '@value': school.location_jp || '' },
      ],
    },
    url: [
      { '@language': 'en', '@value': school.url_en || '' },
      { '@language': 'ja', '@value': school.url_jp || '' },
    ],
    telephone: [
      { '@language': 'en', '@value': school.phone_en || '' },
      { '@language': 'ja', '@value': school.phone_jp || '' },
    ],
    email: [
      { '@language': 'en', '@value': school.email_en || '' },
      { '@language': 'ja', '@value': school.email_jp || '' },
    ],
    image: school.image_url || '/logo.png',
    ...(school.accreditation_en?.length || school.accreditation_jp?.length ? {
      accreditation: [
        ...(school.accreditation_en?.map(acc => ({ '@language': 'en', '@value': acc })) || []),
        ...(school.accreditation_jp?.map(acc => ({ '@language': 'ja', '@value': acc })) || []),
      ],
    } : {}),
    ...(school.education_programs_offered_en?.length || school.education_programs_offered_jp?.length ? {
      educationalProgramme: [
        ...(school.education_programs_offered_en?.map(prog => ({ '@language': 'en', '@value': prog })) || []),
        ...(school.education_programs_offered_jp?.map(prog => ({ '@language': 'ja', '@value': prog })) || []),
      ],
    } : {}),
  };

  return (
    <>
      <Script id="school-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <ClientSchoolDetail school={school} />
    </>
  );
}
