import React, { useMemo } from 'react';
import { Clock, Plus, CheckCircle2 } from 'lucide-react';
import { TimetableCell, HomeworkItem } from '../types';
import { PERIOD_SCHEDULE, getSubjectTheme } from '../services/neisConstants';

interface TodayTimetableProps {
  cells: TimetableCell[];
  homeworks: HomeworkItem[];
  onCellClick: (cell: TimetableCell) => void;
  grade: number;
  classNum: number;
  department: string;
}

export const TodayTimetable: React.FC<TodayTimetableProps> = ({
  cells,
  homeworks,
  onCellClick,
  grade,
  classNum,
  department,
}) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0(일), 1(월), ...
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const todayYMD = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const todayCells = useMemo(() => {
    return cells.filter((c) => c.dateStr === todayYMD).sort((a, b) => a.period - b.period);
  }, [cells, todayYMD]);

  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  const getPeriodStatus = (period: number) => {
    const config = PERIOD_SCHEDULE.find((p) => p.period === period);
    if (!config) return 'upcoming';

    const [sh, sm] = config.start.split(':').map(Number);
    const [eh, em] = config.end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    if (currentMinutes >= startMin && currentMinutes <= endMin) {
      return 'current';
    }
    if (currentMinutes > endMin) {
      return 'completed';
    }
    return 'upcoming';
  };

  const getCellHomeworks = (cell: TimetableCell) => {
    return homeworks.filter(
      (h) =>
        (h.dateStr === cell.dateStr && h.period === cell.period) ||
        (h.dateStr === cell.dateStr && h.subject === cell.subject)
    );
  };

  if (isWeekend) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center shadow-xs transition-colors">
        <div className="text-3xl mb-2">🎉</div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">오늘은 즐거운 주말입니다!</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          상단의 '주간 시간표' 탭에서 다음 주 평일 시간표를 확인하고 미리 과제를 준비해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-2 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>오늘의 수업 시간표</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800">
              {today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            대진전자통신고 {grade}학년 {classNum}반 · {department}
          </p>
        </div>
        <span className="text-xs text-slate-400">교시 카드를 클릭하면 과제를 바로 등록할 수 있습니다.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((p) => {
          const cell = todayCells.find((c) => c.period === p);
          const config = PERIOD_SCHEDULE.find((s) => s.period === p);
          const status = getPeriodStatus(p);
          const theme = getSubjectTheme(cell?.subject || '');
          const cellHws = cell ? getCellHomeworks(cell) : [];
          const pendingHws = cellHws.filter((h) => !h.isCompleted);

          return (
            <div
              key={p}
              onClick={() => cell && onCellClick(cell)}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all shadow-xs cursor-pointer group hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 ${
                status === 'current'
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {p}교시
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {config?.start} ~ {config?.end}
                </span>
              </div>

              {/* 상태 뱃지 */}
              <div className="mb-2">
                {status === 'current' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded animate-pulse">
                    ● 현재 수업 중
                  </span>
                )}
                {status === 'completed' && (
                  <span className="text-[10px] font-medium text-slate-400">수업 종료</span>
                )}
                {status === 'upcoming' && (
                  <span className="text-[10px] font-medium text-slate-500">예정</span>
                )}
              </div>

              {/* 과목명 */}
              <div className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {cell?.subject || '수업 없음'}
              </div>

              <div className="mt-1 text-[11px] text-slate-400">
                {theme.category}
              </div>

              {/* 과제 안내 */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {pendingHws.length > 0 ? (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    과제 {pendingHws.length}건
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    과제 등록
                  </span>
                )}

                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                  클릭
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
