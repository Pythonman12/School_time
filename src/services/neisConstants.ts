/**
 * 대진전자통신고등학교 정보 및 나이스(NEIS) 연동 상수
 */

export const NEIS_CONFIG = {
  OFFICE_CODE: 'C10',        // 부산광역시교육청
  OFFICE_NAME: '부산광역시교육청',
  SCHOOL_CODE: '7150597',    // 대진전자통신고등학교
  SCHOOL_NAME: '대진전자통신고등학교',
  SCHOOL_TYPE: '특성화고등학교',
  ADDRESS: '부산광역시 금정구 수림로 92 (장전동)',
  TEL: '051-582-8100',
  HOMEPAGE: 'http://www.pdj.hs.kr',
  TIMETABLE_API_URL: 'https://open.neis.go.kr/hub/hisTimetable',
  MEAL_API_URL: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
  SCHOOL_INFO_API_URL: 'https://open.neis.go.kr/hub/schoolInfo',
};

// 정규 수업 교시 및 시간표
export const PERIOD_SCHEDULE = [
  { period: 1, start: '09:00', end: '09:50', label: '1교시' },
  { period: 2, start: '10:00', end: '10:50', label: '2교시' },
  { period: 3, start: '11:00', end: '11:50', label: '3교시' },
  { period: 4, start: '12:00', end: '12:50', label: '4교시' },
  { period: 0, start: '12:50', end: '13:40', label: '점심시간' }, // 점심시간
  { period: 5, start: '13:40', end: '14:30', label: '5교시' },
  { period: 6, start: '14:40', end: '15:30', label: '6교시' },
  { period: 7, start: '15:40', end: '16:30', label: '7교시' },
];

export const DAYS_OF_WEEK = [
  { dayIndex: 1, name: '월', full: '월요일' },
  { dayIndex: 2, name: '화', full: '화요일' },
  { dayIndex: 3, name: '수', full: '수요일' },
  { dayIndex: 4, name: '목', full: '목요일' },
  { dayIndex: 5, name: '금', full: '금요일' },
];

// 학년별 학과 및 반 편성 매핑 (대진전자통신고등학교 실제 편제)
export const GRADE_CLASS_MAPPING: Record<number, Record<number, string>> = {
  1: {
    1: '전기전자과',
    2: '전기전자과',
    3: '전기전자과',
    4: 'AI소프트웨어과',
    5: 'AI소프트웨어과',
    6: '스마트콘텐츠과',
    7: '스마트콘텐츠과',
    8: '스마트콘텐츠과',
    9: '산업디자인과',
    10: '산업디자인과',
  },
  2: {
    1: '전기전자과',
    2: '전기전자과',
    3: '전기전자과',
    4: '컴퓨터소프트웨어과',
    5: '컴퓨터소프트웨어과',
    6: '스마트콘텐츠과',
    7: '스마트콘텐츠과',
    8: '스마트콘텐츠과',
    9: '산업디자인과',
    10: '산업디자인과',
  },
  3: {
    1: '전기전자과',
    2: '전기전자과',
    3: '전기전자과',
    4: '컴퓨터소프트웨어과',
    5: '컴퓨터소프트웨어과',
    6: '스마트콘텐츠과',
    7: '스마트콘텐츠과',
    8: '스마트콘텐츠과',
    9: '산업디자인과',
    10: '산업디자인과',
  },
};

export const DEPARTMENT_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  '전기전자과': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-900',
  },
  'AI소프트웨어과': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-900',
  },
  '컴퓨터소프트웨어과': {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-900',
  },
  '스마트콘텐츠과': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-900',
  },
  '산업디자인과': {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-900',
  },
};

// 교과 유형별 스타일링 (시간표 셀 색상 구분)
export function getSubjectTheme(subject: string) {
  if (!subject) return { bg: 'bg-slate-50', text: 'text-slate-500', tag: 'bg-slate-100 text-slate-600', category: '공강/미배정' };

  const s = subject.toLowerCase();
  
  if (s.includes('인공지능') || s.includes('소프트웨어') || s.includes('컴퓨터') || s.includes('사물') || s.includes('iot') || s.includes('프로그래밍') || s.includes('sql') || s.includes('알고리즘') || s.includes('웹') || s.includes('앱') || s.includes('데이터')) {
    return { bg: 'bg-sky-50/70 hover:bg-sky-50', text: 'text-sky-900', border: 'border-sky-200', tag: 'text-sky-700', category: 'SW/AI실습' };
  }
  if (s.includes('회로') || s.includes('전기') || s.includes('전자') || s.includes('하드웨어') || s.includes('센서') || s.includes('마이크로') || s.includes('공기압') || s.includes('자동화')) {
    return { bg: 'bg-amber-50/70 hover:bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', tag: 'text-amber-700', category: '전기전자실습' };
  }
  if (s.includes('디자인') || s.includes('그래픽') || s.includes('조형') || s.includes('시각') || s.includes('콘텐츠') || s.includes('미술')) {
    return { bg: 'bg-pink-50/70 hover:bg-pink-50', text: 'text-pink-900', border: 'border-pink-200', tag: 'text-pink-700', category: '디자인/미디어' };
  }
  if (s.includes('수학') || s.includes('미적분') || s.includes('기하')) {
    return { bg: 'bg-blue-50/70 hover:bg-blue-50', text: 'text-blue-900', border: 'border-blue-200', tag: 'text-blue-700', category: '수학' };
  }
  if (s.includes('영어') || s.includes('국어') || s.includes('문학') || s.includes('사회') || s.includes('역사') || s.includes('한국사') || s.includes('윤리') || s.includes('과학')) {
    return { bg: 'bg-emerald-50/70 hover:bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', tag: 'text-emerald-700', category: '기초교과' };
  }
  if (s.includes('체육') || s.includes('음악') || s.includes('보건')) {
    return { bg: 'bg-teal-50/70 hover:bg-teal-50', text: 'text-teal-900', border: 'border-teal-200', tag: 'text-teal-700', category: '예체능' };
  }
  if (s.includes('동아리') || s.includes('진로') || s.includes('자율') || s.includes('창체') || s.includes('봉사') || s.includes('자치')) {
    return { bg: 'bg-purple-50/70 hover:bg-purple-50', text: 'text-purple-900', border: 'border-purple-200', tag: 'text-purple-700', category: '창의체험' };
  }

  return { bg: 'bg-slate-50/80 hover:bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', tag: 'text-slate-600', category: '전공/일반' };
}

// 6, 7교시 보조 보정 (특성화고 공통 연강 또는 창체/실습 규칙)
export function getFallbackPeriodSubject(dayOfWeek: number, period: number, dept: string, p5Subject?: string): string {
  // 금요일 5, 6, 7교시는 보통 동아리/창의적체험활동/자치활동
  if (dayOfWeek === 5) {
    if (period === 6) return '동아리활동';
    if (period === 7) return '자율·자치활동';
  }
  
  // 5교시가 실습(2연강)인 경우 6교시도 같은 실습인 경우가 많음
  if (period === 6 && p5Subject && (p5Subject.includes('실습') || p5Subject.includes('구조') || p5Subject.includes('센서') || p5Subject.includes('제어') || p5Subject.includes('소프트웨어'))) {
    return p5Subject;
  }

  // 학과별 특화 기본 전공 실습 또는 진로/방과후
  switch (dept) {
    case 'AI소프트웨어과':
      return period === 6 ? '인공지능 프로젝트 실습' : '전공 심화 탐구';
    case '전기전자과':
      return period === 6 ? '전기전자 기초회로 실습' : '하드웨어 프로그래밍';
    case '컴퓨터소프트웨어과':
      return period === 6 ? '소프트웨어 개발 실습' : '알고리즘 문제해결';
    case '스마트콘텐츠과':
      return period === 6 ? '스마트 미디어 제작' : '콘텐츠 기획 실습';
    case '산업디자인과':
      return period === 6 ? '컴퓨터 그래픽 실습' : '제품 디자인 렌더링';
    default:
      return period === 6 ? '전공 실무' : '자율 학습';
  }
}
