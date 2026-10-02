/**
 * 대진전자통신고등학교 시간표 및 과제 관리 시스템 타입 정의
 */

export interface NeisTimetableRow {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드 (C10)
  ATPT_OFCDC_SC_NM: string;   // 부산광역시교육청
  SD_SCHUL_CODE: string;      // 표준학교코드 (7150597)
  SCHUL_NM: string;           // 대진전자통신고등학교
  AY: string;                 // 학년도 (예: 2026)
  SEM: string;                // 학기 (1 or 2)
  ALL_TI_YMD: string;         // 시간표일자 (YYYYMMDD)
  DGHT_CRSE_SC_NM: string;    // 주야과정명
  ORD_SC_NM: string;          // 계열명 (공업계)
  DDDEP_NM: string;           // 학과명 (AI소프트웨어과, 전기전자과 등)
  GRADE: string;              // 학년 (1, 2, 3)
  CLRM_NM: string;            // 강의실명
  CLASS_NM: string;           // 반명 (1 ~ 10)
  PERIO: string;              // 교시 (1 ~ 7)
  ITRT_CNTNT: string;         // 수업내용/과목명 (예: 컴퓨터 구조)
  LOAD_DTM: string;           // 적재일시
}

export interface TimetableCell {
  period: number;             // 1 ~ 7교시
  dateStr: string;            // YYYYMMDD
  formattedDate: string;      // YYYY-MM-DD
  dayOfWeek: number;          // 1 (월) ~ 5 (금)
  dayName: string;            // 월, 화, 수, 목, 금
  subject: string;            // 과목명
  department: string;         // 학과명
  timeRange: string;          // 예: "09:00 - 09:50"
  isCustom?: boolean;         // 사용자 직접 수정 여부
  isNoClass?: boolean;        // 6교시 단축일 등 정규 수업 없는 교시 여부
}

export type HomeworkPriority = 'low' | 'medium' | 'high';

export type HomeworkCategory = '과제/숙제' | '수행평가' | '시험대비' | '준비물' | '기타';

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  category: HomeworkCategory;
  priority: HomeworkPriority;
  dueDate: string;            // YYYY-MM-DD
  grade: number;
  classNum: number;
  department: string;
  period?: number;
  dateStr?: string;           // 관련 수업 일자 YYYYMMDD
  description: string;
  isCompleted: boolean;
  createdAt: string;          // ISO string
  completedAt?: string;       // ISO string
}

export interface UserSettings {
  grade: number;              // 1 ~ 3
  classNum: number;           // 1 ~ 10
  apiKey?: string;            // NEIS Open API Key (선택사항)
  theme?: 'light' | 'dark';
}

export interface MealDietInfo {
  date: string;               // YYYYMMDD
  mealName: string;           // 중식
  dishes: string[];           // 메뉴 리스트
  calories: string;           // 칼로리 (예: 902.2 Kcal)
  originInfo?: string;        // 원산지
  nutrientInfo?: string;      // 영양정보
}

export interface DepartmentInfo {
  name: string;
  classes: number[];
  color: string;
  description: string;
}

export interface SchoolScheduleEvent {
  date: string;               // YYYYMMDD
  formattedDate: string;      // YYYY-MM-DD
  eventName: string;          // 행사명 (예: 개천절, 2학기 중간고사)
  content?: string;           // 세부내용
  gradeTarget: string;        // 1, 2, 3학년 대상 여부
  isHoliday: boolean;         // 휴업일 여부
}

export interface CustomDDay {
  id: string;
  title: string;
  targetDate: string;         // YYYY-MM-DD
  category: '시험' | '과제' | '행사' | '자격증' | '기타';
  createdAt: string;
}
