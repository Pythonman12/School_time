import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Calendar, Printer } from 'lucide-react';
import { GRADE_CLASS_MAPPING, DEPARTMENT_COLORS } from '../services/neisConstants';

interface ClassSelectorProps {
  grade: number;
  classNum: number;
  onGradeChange: (g: number) => void;
  onClassChange: (c: number) => void;
  currentMonday: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onPrint?: () => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  grade,
  classNum,
  onGradeChange,
  onClassChange,
  currentMonday,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  onRefresh,
  isLoading,
  onPrint,
}) => {
  const currentDept = GRADE_CLASS_MAPPING[grade]?.[classNum] || '특성화과';
  const deptStyle = DEPARTMENT_COLORS[currentDept] || {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 text-slate-800',
  };

  // 주간 날짜 범위 텍스트 (예: 2026.09.28 ~ 10.02)
  const fridayDate = new Date(currentMonday);
  fridayDate.setDate(fridayDate.getDate() + 4);

  const startStr = `${currentMonday.getFullYear()}.${String(currentMonday.getMonth() + 1).padStart(2, '0')}.${String(currentMonday.getDate()).padStart(2, '0')}`;
  const endStr = `${String(fridayDate.getMonth() + 1).padStart(2, '0')}.${String(fridayDate.getDate()).padStart(2, '0')}`;

  // 현재 보고 있는 주가 이번 주인지 확인
  const today = new Date();
  const todayDay = today.getDay();
  const thisWeekMon = new Date(today);
  thisWeekMon.setDate(today.getDate() - (todayDay === 0 ? 6 : todayDay - 1));
  thisWeekMon.setHours(0, 0, 0, 0);

  const isCurrentWeek =
    currentMonday.getFullYear() === thisWeekMon.getFullYear() &&
    currentMonday.getMonth() === thisWeekMon.getMonth() &&
    currentMonday.getDate() === thisWeekMon.getDate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* 학년 및 반 선택 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 학년 선택 */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800 rounded-lg">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGradeChange(g)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
                  grade === g
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {g}학년
              </button>
            ))}
          </div>

          {/* 반 선택 드롭다운 */}
          <div className="flex items-center gap-2">
            <label htmlFor="class-select" className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              학급
            </label>
            <select
              id="class-select"
              value={classNum}
              onChange={(e) => onClassChange(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => {
                const dept = GRADE_CLASS_MAPPING[grade]?.[c] || '';
                return (
                  <option key={c} value={c}>
                    {c}반 · {dept}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 학과 뱃지 */}
          <div className="flex items-center gap-2 pl-1">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${deptStyle.bg} ${deptStyle.text} ${deptStyle.border} whitespace-nowrap`}
            >
              {currentDept}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              대진전자통신고 {grade}학년 {classNum}반
            </span>
          </div>
        </div>

        {/* 주간 이동 및 새로고침 컨트롤 */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {/* 주간 네비게이션 */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 rounded-lg p-1">
            <button
              type="button"
              onClick={onPrevWeek}
              title="이전 주"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums whitespace-nowrap flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {startStr} ~ {endStr}
              </span>
            </div>

            <button
              type="button"
              onClick={onNextWeek}
              title="다음 주"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 오늘/이번 주 버튼 */}
          <button
            type="button"
            onClick={onThisWeek}
            disabled={isCurrentWeek}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              isCurrentWeek
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-default'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95'
            }`}
          >
            이번 주
          </button>

          {/* 새로고침 버튼 */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="나이스 최신 시간표 다시 불러오기"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
            <span className="hidden sm:inline">새로고침</span>
          </button>
        </div>
      </div>
    </div>
  );
};
