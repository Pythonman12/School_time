import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { SchoolScheduleEvent } from '../types';
import { fetchSchoolSchedule } from '../services/neisApi';

interface AcademicCalendarProps {
  apiKey?: string;
  grade: number;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ apiKey, grade }) => {
  // 현재 보고 있는 달력 연월
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<SchoolScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    formatted: string;
    events: SchoolScheduleEvent[];
  } | null>(null);

  // 필터 상태
  const [gradeFilter, setGradeFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'exam' | 'holiday' | 'event'>('all');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayYMD = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }, [today]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based

  // 해당 월의 시작일과 종료일 계산
  const { monthStart, monthEnd } = useMemo(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { monthStart: start, monthEnd: end };
  }, [year, month]);

  // 해당 월 학사일정 불러오기
  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSchoolSchedule(monthStart, monthEnd, apiKey);
      setEvents(data);
    } catch (e) {
      console.warn('Failed to load schedule:', e);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [year, month, apiKey]);

  // 달력 그리드 일자 생성 (일요일 시작)
  const calendarCells = useMemo(() => {
    const startDayOfWeek = monthStart.getDay(); // 0(일) ~ 6(토)
    const totalDays = monthEnd.getDate();

    const cells: {
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSunday: boolean;
      isSaturday: boolean;
    }[] = [];

    // 전달 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push({
        dateStr: '',
        dayNum: 0,
        isCurrentMonth: false,
        isToday: false,
        isSunday: i === 0,
        isSaturday: i === 6,
      });
    }

    // 이번 달 일자
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      const dayOfWeek = curDate.getDay();
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}${mStr}${dStr}`;

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayYMD,
        isSunday: dayOfWeek === 0,
        isSaturday: dayOfWeek === 6,
      });
    }

    // 다음 달 잔여 빈 칸 채우기 (7의 배수)
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({
          dateStr: '',
          dayNum: 0,
          isCurrentMonth: false,
          isToday: false,
          isSunday: false,
          isSaturday: false,
        });
      }
    }

    return cells;
  }, [monthStart, monthEnd, year, month, todayYMD]);

  // 학년 및 카테고리 필터링된 이벤트
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. 학년 필터
      if (gradeFilter !== 'all') {
        const targetStr = `${gradeFilter}학년`;
        if (ev.gradeTarget !== '전학년' && ev.gradeTarget !== '전체 대상' && !ev.gradeTarget.includes(targetStr)) {
          return false;
        }
      }

      // 2. 분류 필터
      if (typeFilter === 'holiday') {
        return ev.isHoliday;
      }
      if (typeFilter === 'exam') {
        const n = ev.eventName;
        return n.includes('고사') || n.includes('평가') || n.includes('모의') || n.includes('수능');
      }
      if (typeFilter === 'event') {
        return !ev.isHoliday && !ev.eventName.includes('고사') && !ev.eventName.includes('평가');
      }

      return true;
    });
  }, [events, gradeFilter, typeFilter]);

  // 특정 날짜의 이벤트 목록 가져오기
  const getEventsForDate = (dateStr: string) => {
    if (!dateStr) return [];
    return filteredEvents.filter((ev) => ev.date === dateStr);
  };

  // D-Day 계산
  const getDDay = (targetYMD: string) => {
    const y = parseInt(targetYMD.slice(0, 4), 10);
    const m = parseInt(targetYMD.slice(4, 6), 10) - 1;
    const d = parseInt(targetYMD.slice(6, 8), 10);
    const target = new Date(y, m, d);
    target.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `D+${Math.abs(days)} 지남`, isPast: true, days };
    if (days === 0) return { text: 'D-Day (오늘)', isToday: true, isPast: false, days };
    return { text: `D-${days}`, isPast: false, days };
  };

  const changeMonth = (diff: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + diff);
    setCurrentDate(next);
    setSelectedDayEvents(null);
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDayEvents(null);
  };

  // 이벤트 성격에 따른 뱃지 색상
  const getEventBadgeStyle = (ev: SchoolScheduleEvent) => {
    if (ev.isHoliday) {
      return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    const n = ev.eventName;
    if (n.includes('고사') || n.includes('평가') || n.includes('시험')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-semibold';
    }
    if (n.includes('방학') || n.includes('개학') || n.includes('입학') || n.includes('졸업')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold';
    }
    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="space-y-4">
      {/* 1. 상단 안내 및 공식 데이터셋 출처 배너 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                대진전자통신고등학교 학사일정 달력
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              교육부 나이스(NEIS) 교육정보 개방포털 실시간 공식 학사일정 연동
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://open.neis.go.kr/portal/data/service/selectServicePage.do?page=1&rows=10&sortColumn=&sortDirection=&infId=OPEN17220190722175038389180&infSeq=1"
              target="_blank"
              rel="noreferrer"
              title="나이스 학사일정 오픈 데이터 서비스 페이지 열기"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <span>나이스 학사일정 데이터셋</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={loadSchedule}
              disabled={isLoading}
              title="최신 학사일정 다시 불러오기"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">새로고침</span>
            </button>
          </div>
        </div>

        {/* 필터 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* 학년 필터 */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">대상 학년:</span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setGradeFilter('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  gradeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                전체
              </button>
              {[1, 2, 3].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGradeFilter(String(g) as any)}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                    gradeFilter === String(g)
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {g}학년
                </button>
              ))}
            </div>
          </div>

          {/* 일정 구분 필터 */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">일정 구분:</span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('exam')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  typeFilter === 'exam'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                시험/평가
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('holiday')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  typeFilter === 'holiday'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                휴업일/공휴일
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('event')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                  typeFilter === 'event'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                학사행사
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 대형 월간 캘린더 (달력형 뷰어) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
        {/* 달력 헤더 컨트롤 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {year}년 {month + 1}월
            </h3>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                title="이전 달"
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={jumpToToday}
                className="px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                이번 달
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                title="다음 달"
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 범례 표시 */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> 시험/고사
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> 휴업일/공휴일
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> 학교 행사
            </span>
          </div>
        </div>

        {/* 캘린더 테이블 그리드 */}
        <div className="overflow-x-auto">
          <div className="min-w-[650px]">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs py-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-rose-500">일</span>
              <span className="text-slate-700 dark:text-slate-300">월</span>
              <span className="text-slate-700 dark:text-slate-300">화</span>
              <span className="text-slate-700 dark:text-slate-300">수</span>
              <span className="text-slate-700 dark:text-slate-300">목</span>
              <span className="text-slate-700 dark:text-slate-300">금</span>
              <span className="text-blue-500">토</span>
            </div>

            {/* 날짜 셀 그리드 */}
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  나이스에서 {year}년 {month + 1}월 학사일정을 조회하고 있습니다...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 pt-1">
                {calendarCells.map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return (
                      <div
                        key={idx}
                        className="min-h-[105px] bg-slate-50/40 dark:bg-slate-950/40 rounded-lg border border-transparent"
                      />
                    );
                  }

                  const dayEvents = getEventsForDate(cell.dateStr);
                  const isSelected = selectedDayEvents?.dateStr === cell.dateStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (dayEvents.length > 0) {
                          setSelectedDayEvents({
                            dateStr: cell.dateStr,
                            formatted: `${year}년 ${month + 1}월 ${cell.dayNum}일`,
                            events: dayEvents,
                          });
                        }
                      }}
                      className={`min-h-[105px] p-2 rounded-lg border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20 z-10'
                          : cell.isToday
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      } ${dayEvents.length > 0 ? 'cursor-pointer hover:shadow-xs' : ''}`}
                    >
                      {/* 날짜 숫자 */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold tabular-nums inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            cell.isToday
                              ? 'bg-blue-600 text-white shadow-xs'
                              : cell.isSunday
                              ? 'text-rose-500'
                              : cell.isSaturday
                              ? 'text-blue-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {cell.isToday && (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            오늘
                          </span>
                        )}
                      </div>

                      {/* 학사일정 이벤트 칩 */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayEvents.map((ev, evIdx) => (
                          <div
                            key={evIdx}
                            title={`${ev.eventName} (${ev.gradeTarget})`}
                            className={`text-[11px] px-1.5 py-0.5 rounded border leading-tight truncate transition-colors ${getEventBadgeStyle(
                              ev
                            )}`}
                          >
                            <span className="font-semibold">{ev.eventName}</span>
                            {ev.gradeTarget !== '전학년' && ev.gradeTarget !== '전체 대상' && (
                              <span className="text-[10px] opacity-75 ml-1">
                                [{ev.gradeTarget}]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 하단 점 표시 (이벤트 존재 시) */}
                      {dayEvents.length > 0 && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-1">
                          {dayEvents.length}개 일정
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 선택한 날짜 세부 행사 팝업 / 카드 (날짜 클릭 시 상세 조회) */}
      {selectedDayEvents && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-800 pb-2">
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{selectedDayEvents.formatted} 학사일정 상세</span>
            </h4>
            <button
              type="button"
              onClick={() => setSelectedDayEvents(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayEvents.events.map((ev, i) => {
              const dday = getDDay(ev.date);

              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 rounded-lg p-3.5 space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {ev.gradeTarget}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">
                      {dday.text}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {ev.eventName}
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    구분: {ev.isHoliday ? '휴업일/공휴일' : '정규 수업일'}
                  </div>

                  {ev.content && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                      {ev.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 이달의 주요 학사일정 목록 요약 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>{year}년 {month + 1}월 학사일정 요약 ({filteredEvents.length}건)</span>
          </span>
          <span className="text-xs font-normal text-slate-400">날짜순 정렬</span>
        </h4>

        {filteredEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            {month + 1}월에는 예정된 학사일정이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEvents.map((ev, i) => {
              const dday = getDDay(ev.date);

              return (
                <div
                  key={i}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 tabular-nums w-20">
                      {ev.formattedDate.slice(5)}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ev.eventName}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {ev.gradeTarget}
                    </span>
                    {ev.isHoliday && (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                        휴업일
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-bold tabular-nums px-2 py-0.5 rounded ${
                      dday.isToday
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : dday.isPast
                        ? 'text-slate-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {dday.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
