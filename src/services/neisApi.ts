/**
 * 나이스(NEIS) 교육정보 개방 포털 API 통신 클라이언트
 * 대진전자통신고등학교 실시간 시간표 및 급식 정보 조회
 */

import { NeisTimetableRow, TimetableCell, MealDietInfo, SchoolScheduleEvent } from '../types';
import {
  NEIS_CONFIG,
  GRADE_CLASS_MAPPING,
  PERIOD_SCHEDULE,
  DAYS_OF_WEEK,
  getFallbackPeriodSubject,
} from './neisConstants';
import { getCachedTimetable, setCachedTimetable, getCustomTimetableCells } from './storage';

// 날짜 유틸리티: YYYYMMDD 형식 문자열 변환
export function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// 날짜 유틸리티: YYYY-MM-DD 포맷
export function toHyphenYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// YYYYMMDD를 Date 객체로 변환
export function parseYMD(ymd: string): Date {
  const y = parseInt(ymd.substring(0, 4), 10);
  const m = parseInt(ymd.substring(4, 6), 10) - 1;
  const d = parseInt(ymd.substring(6, 8), 10);
  return new Date(y, m, d);
}

// 주어진 날짜가 속한 주의 월요일 구하기
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0: Sun, 1: Mon, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// 학년도 및 학기 계산
export function getSchoolYearSemester(date: Date): { year: string; semester: string } {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1 ~ 12

  // 1, 2월은 직전 학년도 2학기
  if (m === 1 || m === 2) {
    return { year: String(y - 1), semester: '2' };
  }
  // 3월 ~ 7월은 1학기
  if (m >= 3 && m <= 7) {
    return { year: String(y), semester: '1' };
  }
  // 8월 ~ 12월은 2학기
  return { year: String(y), semester: '2' };
}

/**
 * 주간 시간표 조회 (월~금, 1~7교시)
 */
export async function fetchWeeklyTimetable(
  grade: number,
  classNum: number,
  mondayDate: Date,
  customApiKey?: string
): Promise<{ cells: TimetableCell[]; department: string; isFromCache: boolean; error?: string }> {
  const mondayYMD = toYMD(mondayDate);
  const fridayDate = new Date(mondayDate);
  fridayDate.setDate(fridayDate.getDate() + 4);
  const fridayYMD = toYMD(fridayDate);

  const dept = GRADE_CLASS_MAPPING[grade]?.[classNum] || '특성화과';
  const cacheKey = `${grade}_${classNum}_${mondayYMD}`;

  // 캐시 확인
  const cached = getCachedTimetable(cacheKey);
  const customCells = getCustomTimetableCells();

  // 평일 5일 날짜 배열 생성
  const weekDates: { date: Date; ymd: string; dayIndex: number; dayName: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const cur = new Date(mondayDate);
    cur.setDate(cur.getDate() + i);
    weekDates.push({
      date: cur,
      ymd: toYMD(cur),
      dayIndex: i + 1,
      dayName: DAYS_OF_WEEK[i].name,
    });
  }

  try {
    let rawRows: NeisTimetableRow[] = [];

    if (customApiKey && customApiKey.trim().length > 5) {
      // 정식 API 키가 있는 경우: TI_FROM_YMD ~ TI_TO_YMD 범위 쿼리로 전체 1~7교시 한번에 호출
      const params = new URLSearchParams({
        KEY: customApiKey.trim(),
        Type: 'json',
        pIndex: '1',
        pSize: '100',
        ATPT_OFCDC_SC_CODE: NEIS_CONFIG.OFFICE_CODE,
        SD_SCHUL_CODE: NEIS_CONFIG.SCHOOL_CODE,
        GRADE: String(grade),
        CLASS_NM: String(classNum),
        TI_FROM_YMD: mondayYMD,
        TI_TO_YMD: fridayYMD,
      });

      const res = await fetch(`${NEIS_CONFIG.TIMETABLE_API_URL}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hisTimetable?.[1]?.row) {
          rawRows = data.hisTimetable[1].row;
        }
      }
    } else {
      // 샘플 키 (API Key 미입력 시): NEIS 오픈 API 특성상 1회 호출당 5건 제한이므로
      // 월~금 5일에 대해 각각 호출하여 1~5교시 데이터를 수집
      const dayPromises = weekDates.map(async (wd) => {
        try {
          const params = new URLSearchParams({
            Type: 'json',
            ATPT_OFCDC_SC_CODE: NEIS_CONFIG.OFFICE_CODE,
            SD_SCHUL_CODE: NEIS_CONFIG.SCHOOL_CODE,
            ALL_TI_YMD: wd.ymd,
            GRADE: String(grade),
            CLASS_NM: String(classNum),
          });
          const res = await fetch(`${NEIS_CONFIG.TIMETABLE_API_URL}?${params.toString()}`);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.hisTimetable?.[1]?.row as NeisTimetableRow[]) || [];
        } catch (e) {
          console.warn(`Failed to fetch timetable for ${wd.ymd}`, e);
          return [];
        }
      });

      const results = await Promise.all(dayPromises);
      rawRows = results.flat();
    }

    // 시간표 셀 구조화: 5일(월~금) x 7교시 = 총 35칸
    const cells: TimetableCell[] = [];

    for (const wd of weekDates) {
      // 해당 날짜의 NEIS 로우들
      const dayRows = rawRows.filter((r) => r.ALL_TI_YMD === wd.ymd);
      
      // 5교시 과목 추출 (연강 보정용)
      const p5Row = dayRows.find((r) => parseInt(r.PERIO, 10) === 5);
      const p5Subject = p5Row?.ITRT_CNTNT?.trim() || '';

      for (let p = 1; p <= 7; p++) {
        const periodConfig = PERIOD_SCHEDULE.find((ps) => ps.period === p);
        const timeRange = periodConfig ? `${periodConfig.start} - ${periodConfig.end}` : '';
        const cellCustomKey = `${grade}_${classNum}_${wd.ymd}_${p}`;

        // 1. 사용자 직접 편집 과목명 확인
        if (customCells[cellCustomKey]) {
          cells.push({
            period: p,
            dateStr: wd.ymd,
            formattedDate: toHyphenYMD(wd.date),
            dayOfWeek: wd.dayIndex,
            dayName: wd.dayName,
            subject: customCells[cellCustomKey],
            department: dept,
            timeRange,
            isCustom: true,
          });
          continue;
        }

        // 2. NEIS API 실시간 데이터 매핑
        const matchedRow = dayRows.find((r) => parseInt(r.PERIO, 10) === p);
        if (matchedRow && matchedRow.ITRT_CNTNT) {
          cells.push({
            period: p,
            dateStr: wd.ymd,
            formattedDate: toHyphenYMD(wd.date),
            dayOfWeek: wd.dayIndex,
            dayName: wd.dayName,
            subject: matchedRow.ITRT_CNTNT.trim(),
            department: matchedRow.DDDEP_NM || dept,
            timeRange,
            isCustom: false,
          });
          continue;
        }

        // 3. 샘플 키 제한 등으로 6, 7교시가 비어있을 때 특성화고 정규 실습/창체 보정 적용
        const fallbackSubject = getFallbackPeriodSubject(wd.dayIndex, p, dept, p5Subject);
        cells.push({
          period: p,
          dateStr: wd.ymd,
          formattedDate: toHyphenYMD(wd.date),
          dayOfWeek: wd.dayIndex,
          dayName: wd.dayName,
          subject: fallbackSubject,
          department: dept,
          timeRange,
          isCustom: false,
        });
      }
    }

    // 캐시에 저장
    if (cells.length > 0) {
      setCachedTimetable(cacheKey, cells);
    }

    return { cells, department: dept, isFromCache: false };
  } catch (err: any) {
    console.error('Error in fetchWeeklyTimetable:', err);
    // 오류 시 캐시 데이터가 있으면 반환
    if (cached && cached.length > 0) {
      return { cells: cached, department: dept, isFromCache: true, error: '최신 정보를 불러오지 못해 캐시된 시간표를 표시합니다.' };
    }

    // 완전히 실패한 경우 기본 템플릿 셀 생성
    const fallbackCells: TimetableCell[] = [];
    for (const wd of weekDates) {
      for (let p = 1; p <= 7; p++) {
        const periodConfig = PERIOD_SCHEDULE.find((ps) => ps.period === p);
        fallbackCells.push({
          period: p,
          dateStr: wd.ymd,
          formattedDate: toHyphenYMD(wd.date),
          dayOfWeek: wd.dayIndex,
          dayName: wd.dayName,
          subject: getFallbackPeriodSubject(wd.dayIndex, p, dept),
          department: dept,
          timeRange: periodConfig ? `${periodConfig.start} - ${periodConfig.end}` : '',
        });
      }
    }
    return {
      cells: fallbackCells,
      department: dept,
      isFromCache: false,
      error: '나이스 서버와 연결할 수 없어 기본 시간표를 표시합니다.',
    };
  }
}

/**
 * 대진전자통신고 급식 정보 조회 (NEIS mealServiceDietInfo)
 */
export async function fetchDailyMeal(date: Date, customApiKey?: string): Promise<MealDietInfo | null> {
  const ymd = toYMD(date);
  try {
    const params = new URLSearchParams({
      Type: 'json',
      pIndex: '1',
      pSize: '5',
      ATPT_OFCDC_SC_CODE: NEIS_CONFIG.OFFICE_CODE,
      SD_SCHUL_CODE: NEIS_CONFIG.SCHOOL_CODE,
      MLSV_YMD: ymd,
    });
    if (customApiKey && customApiKey.trim().length > 5) {
      params.append('KEY', customApiKey.trim());
    }

    const res = await fetch(`${NEIS_CONFIG.MEAL_API_URL}?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    const row = data.mealServiceDietInfo?.[1]?.row?.[0];
    if (!row) return null;

    // 메뉴 정제 (<br/> 분리 및 알레르기 번호 정리)
    const rawDishes = row.DDISH_NM ? row.DDISH_NM.split('<br/>') : [];
    const cleanedDishes = rawDishes
      .map((d: string) => d.replace(/[\(\)0-9\.\*]/g, '').trim())
      .filter((d: string) => d.length > 0);

    return {
      date: ymd,
      mealName: row.MMEAL_SC_NM || '중식',
      dishes: cleanedDishes,
      calories: row.CAL_INFO || '',
      originInfo: row.ORPLC_INFO ? row.ORPLC_INFO.replace(/<br\/>/g, ', ') : '',
      nutrientInfo: row.NTR_INFO ? row.NTR_INFO.replace(/<br\/>/g, ', ') : '',
    };
  } catch (e) {
    console.warn('Failed to fetch meal info:', e);
    return null;
  }
}

/**
 * 대진전자통신고 학사일정 조회 (NEIS SchoolSchedule API)
 * infId=OPEN17220190722175038389180&infSeq=1
 */
export async function fetchSchoolSchedule(
  fromDate: Date,
  toDate: Date,
  customApiKey?: string
): Promise<SchoolScheduleEvent[]> {
  try {
    let rows: any[] = [];

    if (customApiKey && customApiKey.trim().length > 5) {
      const params = new URLSearchParams({
        KEY: customApiKey.trim(),
        Type: 'json',
        pIndex: '1',
        pSize: '100',
        ATPT_OFCDC_SC_CODE: NEIS_CONFIG.OFFICE_CODE,
        SD_SCHUL_CODE: NEIS_CONFIG.SCHOOL_CODE,
        AA_FROM_YMD: toYMD(fromDate),
        AA_TO_YMD: toYMD(toDate),
      });
      const res = await fetch(`https://open.neis.go.kr/hub/SchoolSchedule?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        rows = data.SchoolSchedule?.[1]?.row || [];
      }
    } else {
      // 샘플 키의 5건 제한을 우회하기 위해 10일 단위로 구간 분할 병렬 조회
      const slices: { from: string; to: string }[] = [];
      const cur = new Date(fromDate);
      while (cur <= toDate) {
        const sliceStart = new Date(cur);
        const sliceEnd = new Date(cur);
        sliceEnd.setDate(sliceEnd.getDate() + 9);
        if (sliceEnd > toDate) {
          sliceEnd.setTime(toDate.getTime());
        }
        slices.push({ from: toYMD(sliceStart), to: toYMD(sliceEnd) });
        cur.setDate(cur.getDate() + 10);
      }

      const promises = slices.map(async (slice) => {
        try {
          const params = new URLSearchParams({
            Type: 'json',
            ATPT_OFCDC_SC_CODE: NEIS_CONFIG.OFFICE_CODE,
            SD_SCHUL_CODE: NEIS_CONFIG.SCHOOL_CODE,
            AA_FROM_YMD: slice.from,
            AA_TO_YMD: slice.to,
          });
          const res = await fetch(`https://open.neis.go.kr/hub/SchoolSchedule?${params.toString()}`);
          if (!res.ok) return [];
          const data = await res.json();
          return data.SchoolSchedule?.[1]?.row || [];
        } catch {
          return [];
        }
      });

      const batchResults = await Promise.all(promises);
      rows = batchResults.flat();
    }

    // 중복 제거 및 데이터 정제
    const seen = new Set<string>();
    const validEvents: SchoolScheduleEvent[] = [];

    for (const r of rows) {
      if (!r.EVENT_NM || r.EVENT_NM === '토요휴업일') continue;
      const key = `${r.AA_YMD}_${r.EVENT_NM}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const ymd = r.AA_YMD;
      const formatted = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
      const targetParts: string[] = [];
      if (r.ONE_GRADE_EVENT_YN === 'Y') targetParts.push('1학년');
      if (r.TW_GRADE_EVENT_YN === 'Y') targetParts.push('2학년');
      if (r.THREE_GRADE_EVENT_YN === 'Y') targetParts.push('3학년');

      const isHoliday = r.SBTR_DD_SC_NM === '휴업일' || r.SBTR_DD_SC_NM === '공휴일' || r.EVENT_NM.includes('휴업') || r.EVENT_NM.includes('방학') || r.EVENT_NM.includes('공휴일');

      validEvents.push({
        date: ymd,
        formattedDate: formatted,
        eventName: r.EVENT_NM.trim(),
        content: r.EVENT_CNTNT || '',
        gradeTarget: targetParts.length === 3 ? '전학년' : targetParts.length > 0 ? targetParts.join(', ') : '전체 대상',
        isHoliday,
      });
    }

    // 날짜 오름차순 정렬
    validEvents.sort((a, b) => a.date.localeCompare(b.date));
    return validEvents;
  } catch (err) {
    console.warn('Failed to fetch school schedule:', err);
    return [];
  }
}
