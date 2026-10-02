import React from 'react';
import { ShieldCheck, Sun, Moon, Printer, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: 'weekly' | 'today' | 'homework' | 'meal' | 'schedule';
  onTabChange: (tab: 'weekly' | 'today' | 'homework' | 'meal' | 'schedule') => void;
  onOpenConfigModal: () => void;
  homeworkCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenConfigModal,
  homeworkCount,
  isDarkMode,
  onToggleDarkMode,
  onPrint,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('weekly');
          }}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <span>대진전자통신고 시간표</span>
        </a>

        {/* Zone 2: Clean navigation links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => onTabChange('weekly')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            주간 시간표
          </button>

          <button
            type="button"
            onClick={() => onTabChange('today')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            오늘의 수업
          </button>

          <button
            type="button"
            onClick={() => onTabChange('homework')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'homework'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <span>과제함</span>
            {homeworkCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-600 text-white rounded-full tabular-nums">
                {homeworkCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('meal')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'meal'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            급식 식단
          </button>

          <button
            type="button"
            onClick={() => onTabChange('schedule')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            학사일정 (달력)
          </button>
        </nav>

        {/* Zone 3: Actions & Dark mode toggle (과제 등록 버튼 제거됨) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 시간표 인쇄 버튼 */}
          <button
            type="button"
            onClick={onPrint}
            title="시간표 인쇄 / PDF 저장"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* 다크 모드 토글 */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* NEIS 정보 버튼 */}
          <button
            type="button"
            onClick={onOpenConfigModal}
            title="NEIS 학교 정보 및 API 설정"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
