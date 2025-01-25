import { Translations } from '@/interfaces/Translations';

type Language = 'en' | 'jp';

export function getSchoolDetailTranslations(language: Language): Translations {
  return {
    backToList: language === 'en' ? '← Back to School List' : '← 学校一覧に戻る',
    tabs: {
      overview: language === 'en' ? 'Overview' : '概要',
      education: language === 'en' ? 'Education' : '教育',
      admissions: language === 'en' ? 'Admissions' : '入学',
      campus: language === 'en' ? 'Campus' : 'キャンパス',
      studentLife: language === 'en' ? 'Student Life' : '学生生活',
      employment: language === 'en' ? 'Employment' : '採用',
      policies: language === 'en' ? 'Policies' : '方針',
    },
    buttons: {
      edit: language === 'en' ? 'Edit Information' : '情報を編集',
    },
    sections: {
      location: language === 'en' ? 'Location' : '所在地',
      contactInfo: language === 'en' ? 'Contact Information' : '連絡先',
      email: language === 'en' ? 'Email' : 'メール',
      phone: language === 'en' ? 'Phone' : '電話',
      website: language === 'en' ? 'Website' : 'ウェブサイト',
      visitWebsite: language === 'en' ? 'Visit Website' : 'ウェブサイトを見る',
      aboutSchool: language === 'en' ? 'About the School' : '学校について',
      affiliations: language === 'en' ? 'Affiliations' : '提携',
      accreditations: language === 'en' ? 'Accreditations' : '認定',
      virtualTour: language === 'en' ? 'Take a Virtual Tour' : 'バーチャルツアーを見る',
      education: language === 'en' ? 'Education' : '教育',
      programsOffered: language === 'en' ? 'Programs Offered' : '提供プログラム',
      noProgramsListed: language === 'en' ? 'No programs listed' : 'プログラムの記載なし',
      curriculum: language === 'en' ? 'Curriculum' : 'カリキュラム',
      noCurriculum:
        language === 'en' ? 'No curriculum information available' : 'カリキュラム情報なし',
      admissions: language === 'en' ? 'Admissions' : '入学案内',
      acceptancePolicy: language === 'en' ? 'Acceptance Policy' : '入学方針',
      noAcceptancePolicy:
        language === 'en' ? 'No acceptance policy information available' : '入学方針情報なし',
      applicationGuidelines: language === 'en' ? 'Application Guidelines' : '出願ガイドライン',
      noGuidelines:
        language === 'en' ? 'No application guidelines available' : '出願ガイドラインなし',
      feesOverview: language === 'en' ? 'Fees Overview' : '費用概要',
      noFees: language === 'en' ? 'No fees information available' : '費用情報なし',
      detailedFees: language === 'en' ? 'Detailed Fee Structure' : '詳細な費用構成',
      applicationFee: language === 'en' ? 'Application Fee' : '出願料',
      tuition: language === 'en' ? 'Tuition' : '授業料',
      registration: language === 'en' ? 'Registration' : '登録料',
      maintenance: language === 'en' ? 'Maintenance' : '施設維持費',
      facilities: language === 'en' ? 'Campus Facilities' : 'キャンパス施設',
      noFacilities: language === 'en' ? 'No facilities information available' : '施設情報なし',
      studentLife: language === 'en' ? 'Student Life' : '学生生活',
      counseling: language === 'en' ? 'Counseling Services' : 'カウンセリングサービス',
      supportServices: language === 'en' ? 'Support Services' : 'サポートサービス',
      library: language === 'en' ? 'Library' : '図書館',
      calendar: language === 'en' ? 'Academic Calendar' : '学年暦',
      academicSupport:
        language === 'en' ? 'Academic Support & Activities' : '学習支援とアクティビティ',
      academicSupportTitle: language === 'en' ? 'Academic Support' : '学習支援',
      extracurricular: language === 'en' ? 'Extracurricular Activities' : '課外活動',
      staffEmployment: language === 'en' ? 'Staff & Employment' : 'スタッフと採用',
      staff: language === 'en' ? 'Staff' : 'スタッフ',
      boardMembers: language === 'en' ? 'Board Members' : '理事会メンバー',
      openPositions: language === 'en' ? 'Open Positions' : '求人情報',
      applicationProcess: language === 'en' ? 'Application Process' : '応募プロセス',
      events: language === 'en' ? 'School Events' : '学校行事',
      policies: language === 'en' ? 'School Policies' : '学校方針',
      privacyPolicy: language === 'en' ? 'Privacy Policy' : 'プライバシーポリシー',
      termsOfUse: language === 'en' ? 'Terms of Use' : '利用規約',
      daycare: language === 'en' ? 'Day Care' : '保育',
      kindergarten: language === 'en' ? 'Kindergarten' : '幼稚園',
      elementary: language === 'en' ? 'Elementary School' : '小学校',
      juniorhigh: language === 'en' ? 'Junior High School' : '中学校',
      highschool: language === 'en' ? 'High School' : '高校',
      summerSchool: language === 'en' ? 'Summer School' : 'サマースクール',
      otherFees: language === 'en' ? 'Other Fees' : 'その他の費用',
      noFeeInfo: language === 'en' ? 'No fee information available' : '費用情報なし',
      ageRequirements: language === 'en' ? 'Age Requirements' : '年齢要件',
      languageRequirementsStudents:
        language === 'en' ? 'Student Language Requirements' : '生徒の言語要件',
      languageRequirementsParents:
        language === 'en' ? 'Parent Language Requirements' : '保護者の言語要件',
      noInfo: language === 'en' ? 'No information available' : '情報なし',
    },
  };
}
