/**
 * 로컬 스토리지(localStorage) 데이터 영속화 서비스
 * 대진전자통신고 시간표 앱의 과제 등록, 상태 변경, 설정 관리
 */

import { HomeworkItem, UserSettings, TimetableCell, CustomDDay } from '../types';

const HOMEWORK_STORAGE_KEY = 'daejin_homework_items_v2';
const SETTINGS_STORAGE_KEY = 'daejin_user_settings_v2';
const CUSTOM_CELLS_STORAGE_KEY = 'daejin_custom_cells_v2';
const DDAYS_STORAGE_KEY = 'daejin_custom_ddays_v2';
const TIMETABLE_CACHE_KEY_PREFIX = 'daejin_tt_cache_v2_';

// 기본 D-Day 목표 일정
const DEFAULT_DDAYS: CustomDDay[] = [
  {
    id: 'dday_1',
    title: '2학기 중간평가 / 과제 마감',
    targetDate: '2026-10-23',
    category: '시험',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dday_2',
    title: '전공 실기 및 정보처리기능사 실기',
    targetDate: '2026-11-14',
    category: '자격증',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dday_3',
    title: '대진전자통신고 동아리 축제',
    targetDate: '2026-12-18',
    category: '행사',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dday_4',
    title: '겨울방학식',
    targetDate: '2026-12-30',
    category: '행사',
    createdAt: new Date().toISOString(),
  },
];

export function getStoredDDays(): CustomDDay[] {
  try {
    const raw = localStorage.getItem(DDAYS_STORAGE_KEY);
    if (!raw) return DEFAULT_DDAYS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_DDAYS;
  } catch {
    return DEFAULT_DDAYS;
  }
}

export function saveCustomDDay(dday: Omit<CustomDDay, 'id' | 'createdAt'> & { id?: string }): CustomDDay {
  const list = getStoredDDays();
  if (dday.id) {
    const idx = list.findIndex((d) => d.id === dday.id);
    if (idx >= 0) {
      const updated: CustomDDay = { ...list[idx], ...dday };
      list[idx] = updated;
      localStorage.setItem(DDAYS_STORAGE_KEY, JSON.stringify(list));
      return updated;
    }
  }

  const newItem: CustomDDay = {
    ...dday,
    id: `dday_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...list];
  localStorage.setItem(DDAYS_STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function deleteCustomDDay(id: string): boolean {
  const list = getStoredDDays();
  const filtered = list.filter((d) => d.id !== id);
  localStorage.setItem(DDAYS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// 기본 사용자 설정 (기본값: 1학년 4반 AI소프트웨어과)
const DEFAULT_SETTINGS: UserSettings = {
  grade: 1,
  classNum: 4,
  apiKey: '',
  theme: 'light',
};

// 과제 목록 가져오기
export function getStoredHomeworks(): HomeworkItem[] {
  try {
    const raw = localStorage.getItem(HOMEWORK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load homework from localStorage:', err);
    return [];
  }
}

// 과제 추가 또는 업데이트
export function saveHomework(
  item: Omit<HomeworkItem, 'id' | 'createdAt'> & { id?: string }
): HomeworkItem {
  const currentList = getStoredHomeworks();
  const now = new Date().toISOString();

  if (item.id) {
    // 업데이트
    const existingIndex = currentList.findIndex((h) => h.id === item.id);
    if (existingIndex >= 0) {
      const updatedItem: HomeworkItem = {
        ...currentList[existingIndex],
        ...item,
        id: item.id,
        completedAt: item.isCompleted ? currentList[existingIndex].completedAt || now : undefined,
      };
      currentList[existingIndex] = updatedItem;
      localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(currentList));
      return updatedItem;
    }
  }

  // 신규 생성
  const newItem: HomeworkItem = {
    ...item,
    id: `hw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    completedAt: item.isCompleted ? now : undefined,
  };

  const updatedList = [newItem, ...currentList];
  localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(updatedList));
  return newItem;
}

// 과제 완료 상태 토글
export function toggleHomeworkCompletion(id: string): HomeworkItem | null {
  const currentList = getStoredHomeworks();
  const index = currentList.findIndex((h) => h.id === id);
  if (index === -1) return null;

  const target = currentList[index];
  const nextCompleted = !target.isCompleted;
  const updated: HomeworkItem = {
    ...target,
    isCompleted: nextCompleted,
    completedAt: nextCompleted ? new Date().toISOString() : undefined,
  };

  currentList[index] = updated;
  localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(currentList));
  return updated;
}

// 과제 삭제
export function deleteHomework(id: string): boolean {
  const currentList = getStoredHomeworks();
  const filtered = currentList.filter((h) => h.id !== id);
  if (filtered.length === currentList.length) return false;
  localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// 사용자 설정 불러오기
export function getStoredUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load user settings:', err);
    return DEFAULT_SETTINGS;
  }
}

// 사용자 설정 저장하기
export function saveStoredUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getStoredUserSettings();
  const updated: UserSettings = { ...current, ...settings };
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// 사용자 정의/수정된 시간표 셀 저장 (학생이 6, 7교시나 과목명을 수정한 경우)
export function getCustomTimetableCells(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_CELLS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomTimetableCell(key: string, subject: string): void {
  const current = getCustomTimetableCells();
  if (subject) {
    current[key] = subject;
  } else {
    delete current[key];
  }
  localStorage.setItem(CUSTOM_CELLS_STORAGE_KEY, JSON.stringify(current));
}

// 시간표 캐시
export function getCachedTimetable(cacheKey: string): TimetableCell[] | null {
  try {
    const raw = localStorage.getItem(TIMETABLE_CACHE_KEY_PREFIX + cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.cells || null;
  } catch {
    return null;
  }
}

export function setCachedTimetable(cacheKey: string, cells: TimetableCell[]): void {
  try {
    localStorage.setItem(
      TIMETABLE_CACHE_KEY_PREFIX + cacheKey,
      JSON.stringify({ timestamp: Date.now(), cells })
    );
  } catch (e) {
    console.warn('Failed to cache timetable:', e);
  }
}

// 데이터 내보내기/가져오기 백업 기능
export function exportDataAsJson(): string {
  const homeworks = getStoredHomeworks();
  const settings = getStoredUserSettings();
  const customCells = getCustomTimetableCells();
  const ddays = getStoredDDays();
  const exportPayload = {
    version: 2,
    appName: '대진전자통신고 시간표 & 과제 플래너',
    exportedAt: new Date().toISOString(),
    data: {
      homeworks,
      settings,
      customCells,
      ddays,
    },
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importDataFromJson(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.data) {
      if (Array.isArray(parsed.data.homeworks)) {
        localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(parsed.data.homeworks));
      }
      if (parsed.data.settings) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed.data.settings));
      }
      if (parsed.data.customCells) {
        localStorage.setItem(CUSTOM_CELLS_STORAGE_KEY, JSON.stringify(parsed.data.customCells));
      }
      if (Array.isArray(parsed.data.ddays)) {
        localStorage.setItem(DDAYS_STORAGE_KEY, JSON.stringify(parsed.data.ddays));
      }
      return true;
    }
    return false;
  } catch (e) {
    console.error('JSON import error:', e);
    return false;
  }
}
