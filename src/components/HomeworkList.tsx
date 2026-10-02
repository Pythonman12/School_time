import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  BookOpen,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { HomeworkItem, HomeworkPriority, HomeworkCategory } from '../types';

interface HomeworkListProps {
  homeworks: HomeworkItem[];
  onToggleStatus: (id: string) => void;
  onEdit: (item: HomeworkItem) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export const HomeworkList: React.FC<HomeworkListProps> = ({
  homeworks,
  onToggleStatus,
  onEdit,
  onDelete,
  onExport,
  onImport,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'urgent' | 'eval' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 캘린더 뷰용 선택 월
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getDDayInfo = (dueDateStr: string) => {
    if (!dueDateStr) return { text: '기한 없음', isUrgent: false, isOverdue: false, diffDays: 999 };
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `D+${Math.abs(diffDays)} 지남`, isUrgent: true, isOverdue: true, diffDays };
    }
    if (diffDays === 0) {
      return { text: '오늘 마감', isUrgent: true, isOverdue: false, diffDays };
    }
    if (diffDays === 1) {
      return { text: 'D-1 (내일)', isUrgent: true, isOverdue: false, diffDays };
    }
    if (diffDays <= 3) {
      return { text: `D-${diffDays}`, isUrgent: true, isOverdue: false, diffDays };
    }
    return { text: `D-${diffDays}`, isUrgent: false, isOverdue: false, diffDays };
  };

  const uniqueSubjects = useMemo(() => {
    const subs = new Set<string>();
    homeworks.forEach((h) => {
      if (h.subject) subs.add(h.subject);
    });
    return Array.from(subs).sort();
  }, [homeworks]);

  const stats = useMemo(() => {
    const total = homeworks.length;
    const completed = homeworks.filter((h) => h.isCompleted).length;
    const pending = total - completed;
    const urgent = homeworks.filter((h) => {
      if (h.isCompleted) return false;
      const d = getDDayInfo(h.dueDate);
      return d.diffDays <= 3;
    }).length;

    return { total, completed, pending, urgent };
  }, [homeworks]);

  const filteredHomeworks = useMemo(() => {
    return homeworks
      .filter((h) => {
        if (filterTab === 'pending' && h.isCompleted) return false;
        if (filterTab === 'completed' && !h.isCompleted) return false;
        if (filterTab === 'urgent') {
          if (h.isCompleted) return false;
          const d = getDDayInfo(h.dueDate);
          if (d.diffDays > 3) return false;
        }
        if (filterTab === 'eval' && h.category !== '수행평가') return false;

        if (selectedSubject !== 'all' && h.subject !== selectedSubject) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = h.title.toLowerCase().includes(q);
          const matchSubject = h.subject.toLowerCase().includes(q);
          const matchDesc = h.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchSubject && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
      });
  }, [homeworks, filterTab, selectedSubject, searchQuery]);

  // 캘린더 날짜 그리드 생성
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0(일) ~ 6(토)
    const daysInMonth = lastDay.getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // 이전 달 빈칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dateStr: '', dayNum: 0, isCurrentMonth: false, isToday: false });
    }

    // 이번 달 날짜
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayFormatted,
      });
    }

    return days;
  }, [calendarMonth, today]);

  const changeMonth = (diff: number) => {
    const next = new Date(calendarMonth);
    next.setMonth(next.getMonth() + diff);
    setCalendarMonth(next);
  };

  return (
    <div className="space-y-4">
      {/* 통계 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-colors">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">진행 중인 과제</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {stats.pending}
            <span className="text-xs font-normal text-slate-400 ml-1">건</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-colors">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            마감 임박 (3일 내)
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
            {stats.urgent}
            <span className="text-xs font-normal text-amber-500/80 ml-1">건</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-colors">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            완료한 과제
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {stats.completed}
            <span className="text-xs font-normal text-emerald-500/80 ml-1">건</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs transition-colors">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">총 누적 과제</div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1 tabular-nums">
            {stats.total}
            <span className="text-xs font-normal text-slate-400 ml-1">건</span>
          </div>
        </div>
      </div>

      {/* 필터 및 보기 전환 바 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* 목록 / 캘린더 뷰 전환 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>목록 뷰</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>캘린더 뷰</span>
              </button>
            </div>

            {/* 탭 필터 (목록 모드일 때 활성화) */}
            {viewMode === 'list' && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFilterTab('pending')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    filterTab === 'pending'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  진행 중 ({stats.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('urgent')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    filterTab === 'urgent'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  마감 임박 ({stats.urgent})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('eval')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    filterTab === 'eval'
                      ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  수행평가
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('completed')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    filterTab === 'completed'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  완료됨 ({stats.completed})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    filterTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  전체 ({stats.total})
                </button>
              </div>
            )}
          </div>

          {/* 우측 데이터 백업 내보내기/가져오기 버튼 (과제 등록 버튼 제거됨) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              title="과제 데이터 JSON 백업 내보내기"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onImport}
              title="과제 데이터 JSON 가져오기"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 검색 및 과목 필터 */}
        {viewMode === 'list' && (
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="과제명, 과목명, 메모 내용 검색..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            {uniqueSubjects.length > 0 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <option value="all">모든 과목 ({uniqueSubjects.length})</option>
                {uniqueSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* 캘린더 뷰 모드 */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월 과제 마감 일정
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date())}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
              >
                오늘
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['일', '월', '화', '수', '목', '금', '토'].map((name, i) => (
              <div
                key={name}
                className={`py-1.5 font-bold ${
                  i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {name}
              </div>
            ))}

            {calendarDays.map((day, idx) => {
              if (!day.isCurrentMonth) {
                return <div key={idx} className="min-h-[85px] bg-slate-50/40 dark:bg-slate-800/20 rounded-lg" />;
              }

              const dayHomeworks = homeworks.filter((h) => h.dueDate === day.dateStr);
              const pendingCount = dayHomeworks.filter((h) => !h.isCompleted).length;

              return (
                <div
                  key={idx}
                  className={`min-h-[85px] p-1.5 border rounded-lg text-left flex flex-col justify-between transition-colors ${
                    day.isToday
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs tabular-nums ${day.isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day.dayNum}
                    </span>
                    {pendingCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </div>

                  {/* 마감 과제 목록 칩 */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayHomeworks.slice(0, 2).map((hw) => (
                      <div
                        key={hw.id}
                        onClick={() => onEdit(hw)}
                        title={hw.title}
                        className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${
                          hw.isCompleted
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                            : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-medium'
                        }`}
                      >
                        {hw.title}
                      </div>
                    ))}
                    {dayHomeworks.length > 2 && (
                      <div className="text-[9px] text-slate-400 text-center">
                        +{dayHomeworks.length - 2}건 더보기
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 목록 뷰 모드 */}
      {viewMode === 'list' && (
        <div className="space-y-2.5">
          {filteredHomeworks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs transition-colors">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery || selectedSubject !== 'all'
                  ? '조건에 맞는 과제가 없습니다.'
                  : filterTab === 'completed'
                  ? '완료된 과제가 아직 없습니다.'
                  : '등록된 과제가 없습니다!'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                과제 등록은 <strong>'주간 시간표'</strong> 또는 <strong>'오늘의 수업'</strong>에서 해당 과목 칸을 클릭하시면 즉시 등록할 수 있습니다.
              </p>
            </div>
          ) : (
            filteredHomeworks.map((hw) => {
              const dday = getDDayInfo(hw.dueDate);

              return (
                <div
                  key={hw.id}
                  className={`bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                    hw.isCompleted
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 opacity-75'
                      : dday.isOverdue
                      ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-200 dark:ring-rose-900/50'
                      : dday.isUrgent
                      ? 'border-amber-300 dark:border-amber-700'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* 좌측 체크박스 및 제목/과목 */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(hw.id)}
                      title={hw.isCompleted ? '미완료로 변경' : '완료로 표시'}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                    >
                      {hw.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* 과목명 */}
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800">
                          {hw.subject}
                        </span>

                        {/* 구분 */}
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {hw.category}
                        </span>

                        {/* 중요도 */}
                        {hw.priority === 'high' && (
                          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            긴급
                          </span>
                        )}

                        {hw.period && (
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {hw.period}교시 수업
                          </span>
                        )}
                      </div>

                      {/* 과제 제목 */}
                      <div
                        className={`text-sm font-bold text-slate-900 dark:text-white break-words ${
                          hw.isCompleted ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''
                        }`}
                      >
                        {hw.title}
                      </div>

                      {hw.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 break-words">
                          {hw.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 우측 마감일 및 액션 버튼 */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          {hw.dueDate}
                        </span>
                      </div>

                      <div className="mt-0.5">
                        {hw.isCompleted ? (
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">완료됨</span>
                        ) : (
                          <span
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              dday.isOverdue
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : dday.isUrgent
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {dday.text}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(hw)}
                        title="수정"
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === hw.id ? (
                        <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg animate-in fade-in duration-150">
                          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 px-1">
                            삭제할까요?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(hw.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                          >
                            삭제
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(hw.id)}
                          title="과제 삭제"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
