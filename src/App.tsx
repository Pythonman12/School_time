/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { LiveBellWidget } from './components/LiveBellWidget';
import { ClassSelector } from './components/ClassSelector';
import { TimetableGrid } from './components/TimetableGrid';
import { TodayTimetable } from './components/TodayTimetable';
import { HomeworkList } from './components/HomeworkList';
import { HomeworkModal } from './components/HomeworkModal';
import { CustomSubjectModal } from './components/CustomSubjectModal';
import { MealCard } from './components/MealCard';
import { AcademicCalendar } from './components/AcademicCalendar';
import { NeisConfigModal } from './components/NeisConfigModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { TimetableCell, HomeworkItem, UserSettings } from './types';
import {
  fetchWeeklyTimetable,
  getMondayOfWeek,
} from './services/neisApi';
import {
  getStoredHomeworks,
  saveHomework,
  toggleHomeworkCompletion,
  deleteHomework,
  getStoredUserSettings,
  saveStoredUserSettings,
  saveCustomTimetableCell,
  exportDataAsJson,
  importDataFromJson,
} from './services/storage';
import { GRADE_CLASS_MAPPING } from './services/neisConstants';

export default function App() {
  // 사용자 환경설정 로드
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getStoredUserSettings());

  // 다크 모드 초기화 및 시스템 선호도 감지
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (userSettings.theme) {
      return userSettings.theme === 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // 다크 모드 DOM 동기화
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      saveStoredUserSettings({ theme: next ? 'dark' : 'light' });
      return next;
    });
  };

  // 현재 활성 탭
  const [activeTab, setActiveTab] = useState<'weekly' | 'today' | 'homework' | 'meal' | 'schedule'>('weekly');

  // 학년 및 학급 상태
  const [grade, setGrade] = useState<number>(userSettings.grade || 1);
  const [classNum, setClassNum] = useState<number>(userSettings.classNum || 4);
  const [apiKey, setApiKey] = useState<string>(() => userSettings.apiKey || (import.meta.env.VITE_NEIS_API_KEY as string) || '');

  // 시간표 주간 기준 월요일 날짜
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfWeek(new Date()));

  // 시간표 데이터 및 상태
  const [timetableCells, setTimetableCells] = useState<TimetableCell[]>([]);
  const [department, setDepartment] = useState<string>(
    GRADE_CLASS_MAPPING[grade]?.[classNum] || '특성화과'
  );
  const [isLoadingTimetable, setIsLoadingTimetable] = useState<boolean>(false);
  const [timetableNotice, setTimetableNotice] = useState<string | null>(null);

  // 과제 목록 (로컬스토리지 연동)
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(() => getStoredHomeworks());

  // 모달 제어 상태
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState<boolean>(false);
  const [selectedCellForModal, setSelectedCellForModal] = useState<TimetableCell | null>(null);
  const [editingHomework, setEditingHomework] = useState<HomeworkItem | null>(null);
  const [isNeisModalOpen, setIsNeisModalOpen] = useState<boolean>(false);

  // 과목명 직접 수정 모달
  const [isCustomSubjectModalOpen, setIsCustomSubjectModalOpen] = useState<boolean>(false);
  const [selectedCellForCustomSubject, setSelectedCellForCustomSubject] = useState<TimetableCell | null>(null);

  // 알림 토스트 상태
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'error', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 시간표 데이터 로드 함수
  const loadTimetable = useCallback(
    async (g: number, c: number, monDate: Date, key?: string) => {
      setIsLoadingTimetable(true);
      setTimetableNotice(null);

      try {
        const result = await fetchWeeklyTimetable(g, c, monDate, key);
        setTimetableCells(result.cells);
        setDepartment(result.department);

        if (result.error) {
          setTimetableNotice(result.error);
        }
      } catch (err: any) {
        console.error('Failed to load timetable:', err);
        setTimetableNotice('시간표 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoadingTimetable(false);
      }
    },
    []
  );

  // 학년, 반, 날짜, 키 변경 시 시간표 로드
  useEffect(() => {
    loadTimetable(grade, classNum, currentMonday, apiKey);
  }, [grade, classNum, currentMonday, apiKey, loadTimetable]);

  // 학년 변경 핸들러
  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    saveStoredUserSettings({ grade: newGrade });
  };

  // 반 변경 핸들러
  const handleClassChange = (newClass: number) => {
    setClassNum(newClass);
    saveStoredUserSettings({ classNum: newClass });
  };

  // 주간 네비게이션
  const handlePrevWeek = () => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const handleThisWeek = () => {
    setCurrentMonday(getMondayOfWeek(new Date()));
  };

  // 시간표 셀 클릭 시 과제 등록 모달 오픈
  const handleCellClick = (cell: TimetableCell) => {
    setSelectedCellForModal(cell);
    setEditingHomework(null);
    setIsHomeworkModalOpen(true);
  };

  // 시간표 과목 직접 수정 오픈
  const handleEditCellSubject = (cell: TimetableCell) => {
    setSelectedCellForCustomSubject(cell);
    setIsCustomSubjectModalOpen(true);
  };

  // 시간표 과목명 저장
  const handleSaveCustomSubject = (customKey: string, newSubject: string) => {
    saveCustomTimetableCell(customKey, newSubject);
    addToast('success', newSubject ? '과목명이 수정되었습니다.' : '나이스 원본 과목명으로 복원되었습니다.');
    loadTimetable(grade, classNum, currentMonday, apiKey);
  };

  // 과제 신규 등록 버튼 (일반)
  const handleAddNewHomework = () => {
    setSelectedCellForModal(null);
    setEditingHomework(null);
    setIsHomeworkModalOpen(true);
  };

  // 과제 수정 모달 오픈
  const handleEditHomework = (hw: HomeworkItem) => {
    setSelectedCellForModal(null);
    setEditingHomework(hw);
    setIsHomeworkModalOpen(true);
  };

  // 과제 저장 (로컬스토리지 영속화)
  const handleSaveHomework = (
    itemData: Omit<HomeworkItem, 'id' | 'createdAt'> & { id?: string }
  ) => {
    const saved = saveHomework(itemData);
    setHomeworks(getStoredHomeworks());
    addToast('success', `'${saved.title}' 과제가 로컬 스토리지에 저장되었습니다.`);
  };

  // 과제 완료 상태 토글
  const handleToggleHomework = (id: string) => {
    const updated = toggleHomeworkCompletion(id);
    if (updated) {
      setHomeworks(getStoredHomeworks());
      if (updated.isCompleted) {
        addToast('success', `'${updated.title}' 과제를 완료 처리했습니다.`);
      } else {
        addToast('info', `'${updated.title}' 과제를 진행 중으로 변경했습니다.`);
      }
    }
  };

  // 과제 삭제
  const handleDeleteHomework = (id: string) => {
    deleteHomework(id);
    setHomeworks(getStoredHomeworks());
    addToast('info', '과제가 삭제되었습니다.');
  };

  // NEIS API 키 저장
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    saveStoredUserSettings({ apiKey: newKey });
    addToast('success', newKey ? '개인 나이스 API 인증키가 등록되었습니다.' : '샘플 키 모드로 전환되었습니다.');
    loadTimetable(grade, classNum, currentMonday, newKey);
  };

  // JSON 백업 다운로드
  const handleExportData = () => {
    try {
      const json = exportDataAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daejin_homework_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', '과제 데이터 백업 파일이 다운로드되었습니다.');
    } catch {
      addToast('error', '데이터 내보내기에 실패했습니다.');
    }
  };

  // JSON 백업 불러오기
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = importDataFromJson(content);
        if (ok) {
          setHomeworks(getStoredHomeworks());
          const settings = getStoredUserSettings();
          setGrade(settings.grade);
          setClassNum(settings.classNum);
          setApiKey(settings.apiKey || '');
          addToast('success', '백업된 데이터를 정상적으로 복원했습니다.');
        } else {
          addToast('error', '올바른 백업 파일 형식이 아닙니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const pendingHomeworkCount = homeworks.filter((h) => !h.isCompleted).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* 1. 상단 네비게이션 헤더 */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenConfigModal={() => setIsNeisModalOpen(true)}
        homeworkCount={pendingHomeworkCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onPrint={handlePrint}
      />

      {/* 2. 메인 뷰포트 컨테이너 (1440px 데스크탑 최적화 & 모바일 반응형) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 학교 정보 및 소개 히어로 배너 */}
        <HeroBanner
          grade={grade}
          classNum={classNum}
          department={department}
          onOpenNeisModal={() => setIsNeisModalOpen(true)}
        />

        {/* 실시간 교시 벨 카운트다운 위젯 */}
        <LiveBellWidget todayCells={timetableCells} />

        {/* 안내 알림 (캐시 표시 등) */}
        {timetableNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between no-print">
            <span>{timetableNotice}</span>
            <button
              type="button"
              onClick={() => loadTimetable(grade, classNum, currentMonday, apiKey)}
              className="font-semibold underline ml-2 hover:text-amber-900 dark:hover:text-amber-100"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 학년/학급 및 주간 제어 바 */}
        <ClassSelector
          grade={grade}
          classNum={classNum}
          onGradeChange={handleGradeChange}
          onClassChange={handleClassChange}
          currentMonday={currentMonday}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onThisWeek={handleThisWeek}
          onRefresh={() => loadTimetable(grade, classNum, currentMonday, apiKey)}
          isLoading={isLoadingTimetable}
          onPrint={handlePrint}
        />

        {/* 탭별 뷰 전환 */}
        {activeTab === 'weekly' && (
          <section aria-label="주간 시간표">
            <TimetableGrid
              cells={timetableCells}
              homeworks={homeworks}
              onCellClick={handleCellClick}
              onQuickAddHomework={handleCellClick}
              onEditCellSubject={handleEditCellSubject}
              currentMonday={currentMonday}
              isLoading={isLoadingTimetable}
            />
          </section>
        )}

        {activeTab === 'today' && (
          <section aria-label="오늘의 수업">
            <TodayTimetable
              cells={timetableCells}
              homeworks={homeworks}
              onCellClick={handleCellClick}
              grade={grade}
              classNum={classNum}
              department={department}
            />
          </section>
        )}

        {activeTab === 'homework' && (
          <section aria-label="과제함">
            <HomeworkList
              homeworks={homeworks}
              onToggleStatus={handleToggleHomework}
              onEdit={handleEditHomework}
              onDelete={handleDeleteHomework}
              onExport={handleExportData}
              onImport={handleImportData}
            />
          </section>
        )}

        {activeTab === 'meal' && (
          <section aria-label="급식 식단표">
            <MealCard apiKey={apiKey} />
          </section>
        )}

        {activeTab === 'schedule' && (
          <section aria-label="학사일정 및 D-Day">
            <AcademicCalendar apiKey={apiKey} grade={grade} />
          </section>
        )}
      </main>

      {/* 3. 과제 등록/수정 모달 */}
      <HomeworkModal
        isOpen={isHomeworkModalOpen}
        onClose={() => {
          setIsHomeworkModalOpen(false);
          setSelectedCellForModal(null);
          setEditingHomework(null);
        }}
        onSave={handleSaveHomework}
        onDelete={handleDeleteHomework}
        initialCell={selectedCellForModal}
        editingHomework={editingHomework}
        grade={grade}
        classNum={classNum}
        department={department}
      />

      {/* 4. 과목명 직접 수정 모달 */}
      <CustomSubjectModal
        isOpen={isCustomSubjectModalOpen}
        onClose={() => {
          setIsCustomSubjectModalOpen(false);
          setSelectedCellForCustomSubject(null);
        }}
        cell={selectedCellForCustomSubject}
        onSave={handleSaveCustomSubject}
        grade={grade}
        classNum={classNum}
      />

      {/* 5. 나이스 API 및 학교 정보 모달 */}
      <NeisConfigModal
        isOpen={isNeisModalOpen}
        onClose={() => setIsNeisModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* 6. 피드백 토스트 알림 */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* 푸터 */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">대진전자통신고등학교 시간표 &amp; 과제 플래너</p>
          <p className="text-slate-400 dark:text-slate-500">
            데이터 출처: 교육부 및 한국교육학술정보원(KERIS) 나이스(NEIS) 교육정보 개방포털 (open.neis.go.kr)
          </p>
        </div>
      </footer>
    </div>
  );
}
