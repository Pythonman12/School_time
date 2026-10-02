import React from 'react';
import { Plus, CheckCircle2, Clock, Edit2 } from 'lucide-react';
import { TimetableCell, HomeworkItem } from '../types';
import { PERIOD_SCHEDULE, DAYS_OF_WEEK, getSubjectTheme } from '../services/neisConstants';

interface TimetableGridProps {
  cells: TimetableCell[];
  homeworks: HomeworkItem[];
  onCellClick: (cell: TimetableCell) => void;
  onQuickAddHomework: (cell: TimetableCell) => void;
  onEditCellSubject?: (cell: TimetableCell) => void;
  currentMonday: Date;
  isLoading: boolean;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  cells,
  homeworks,
  onCellClick,
  onQuickAddHomework,
  onEditCellSubject,
  currentMonday,
  isLoading,
}) => {
  const today = new Date();
  const todayYMD = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const weekDays = DAYS_OF_WEEK.map((d, index) => {
    const curDate = new Date(currentMonday);
    curDate.setDate(curDate.getDate() + index);
    const ymd = `${curDate.getFullYear()}${String(curDate.getMonth() + 1).padStart(2, '0')}${String(curDate.getDate()).padStart(2, '0')}`;
    const isToday = ymd === todayYMD;

    return {
      ...d,
      date: curDate,
      ymd,
      displayDate: `${curDate.getMonth() + 1}.${curDate.getDate()}`,
      isToday,
    };
  });

  const getCell = (dayOfWeek: number, period: number): TimetableCell | undefined => {
    return cells.find((c) => c.dayOfWeek === dayOfWeek && c.period === period);
  };

  const getCellHomeworks = (cell: TimetableCell): HomeworkItem[] => {
    return homeworks.filter((hw) => {
      if (hw.dateStr === cell.dateStr && hw.period === cell.period) return true;
      if (hw.dateStr === cell.dateStr && hw.subject === cell.subject) return true;
      return false;
    });
  };

  if (isLoading && cells.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
        <div className="inline-block animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          나이스(NEIS)에서 대진전자통신고 시간표를 불러오는 중입니다...
        </p>
        <p className="text-xs text-slate-400 mt-1">교육정보 개방포털 실시간 데이터 연동</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden transition-colors">
      {/* 안내 띠 */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 no-print">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
            Tip
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            시간표 칸을 클릭하면 <strong className="text-blue-600 dark:text-blue-400">해당 수업의 과제/수행평가를 즉시 등록</strong>할 수 있습니다.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> 과제 있음
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 완료됨
          </span>
        </div>
      </div>

      {/* 시간표 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <th className="w-20 sm:w-24 px-3 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                교시
              </th>
              {weekDays.map((wd) => (
                <th
                  key={wd.dayIndex}
                  className={`px-3 py-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 transition-colors ${
                    wd.isToday ? 'bg-blue-50/80 dark:bg-blue-950/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={`text-sm font-bold ${
                        wd.isToday
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {wd.name}요일
                    </span>
                    {wd.isToday && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded">
                        오늘
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 tabular-nums">
                    {wd.displayDate}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {/* 1교시 ~ 4교시 */}
            {[1, 2, 3, 4].map((period) => {
              const schedule = PERIOD_SCHEDULE.find((s) => s.period === period);

              return (
                <tr key={period} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-2 sm:px-3 py-3 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 align-middle">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {period}교시
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 whitespace-nowrap">
                      {schedule?.start}
                      <br />
                      ~ {schedule?.end}
                    </div>
                  </td>

                  {weekDays.map((wd) => {
                    const cell = getCell(wd.dayIndex, period);
                    const subject = cell?.subject || '수업 없음';
                    const theme = getSubjectTheme(subject);
                    const cellHws = cell ? getCellHomeworks(cell) : [];
                    const pendingHws = cellHws.filter((h) => !h.isCompleted);
                    const completedHws = cellHws.filter((h) => h.isCompleted);

                    return (
                      <td
                        key={wd.dayIndex}
                        onClick={() => cell && onCellClick(cell)}
                        className={`p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top transition-all duration-150 cursor-pointer group relative hover:ring-2 hover:ring-blue-500/30 hover:z-10 ${
                          wd.isToday ? 'bg-blue-50/20 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {cell ? (
                          <div
                            className={`h-full min-h-[78px] rounded-lg p-2.5 transition-all border ${theme.bg} ${theme.border} dark:bg-slate-800/70 dark:border-slate-700/80`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-semibold tracking-tight ${theme.tag} dark:text-blue-300`}>
                                {theme.category}
                              </span>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                {onEditCellSubject && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditCellSubject(cell);
                                    }}
                                    title="과목명 직접 수정"
                                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickAddHomework(cell);
                                  }}
                                  title="이 수업에 과제 등록"
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-white dark:hover:bg-slate-700 rounded transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                              {subject}
                            </div>

                            {cellHws.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {pendingHws.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded shadow-xs">
                                    <Clock className="w-2.5 h-2.5" />
                                    과제 {pendingHws.length}건
                                  </span>
                                )}
                                {completedHws.length > 0 && pendingHws.length === 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    완료됨
                                  </span>
                                )}
                              </div>
                            )}

                            {cellHws.length === 0 && (
                              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5 no-print">
                                <Plus className="w-3 h-3" />
                                <span>과제 등록</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[78px] rounded-lg p-2.5 border border-dashed border-slate-200 dark:border-slate-800 text-center flex items-center justify-center text-xs text-slate-400">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* 점심시간 구분선 */}
            <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <td colSpan={6} className="py-2 px-4 text-center text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  🍚 점심시간 및 휴식 (12:50 ~ 13:40)
                </span>
              </td>
            </tr>

            {/* 5교시 ~ 7교시 */}
            {[5, 6, 7].map((period) => {
              const schedule = PERIOD_SCHEDULE.find((s) => s.period === period);

              return (
                <tr key={period} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-2 sm:px-3 py-3 text-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 align-middle">
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                      {period}교시
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5 whitespace-nowrap">
                      {schedule?.start}
                      <br />
                      ~ {schedule?.end}
                    </div>
                  </td>

                  {weekDays.map((wd) => {
                    const cell = getCell(wd.dayIndex, period);
                    const subject = cell?.subject || '수업 없음';
                    const theme = getSubjectTheme(subject);
                    const cellHws = cell ? getCellHomeworks(cell) : [];
                    const pendingHws = cellHws.filter((h) => !h.isCompleted);
                    const completedHws = cellHws.filter((h) => h.isCompleted);

                    return (
                      <td
                        key={wd.dayIndex}
                        onClick={() => cell && onCellClick(cell)}
                        className={`p-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top transition-all duration-150 cursor-pointer group relative hover:ring-2 hover:ring-blue-500/30 hover:z-10 ${
                          wd.isToday ? 'bg-blue-50/20 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {cell ? (
                          <div
                            className={`h-full min-h-[78px] rounded-lg p-2.5 transition-all border ${theme.bg} ${theme.border} dark:bg-slate-800/70 dark:border-slate-700/80`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-semibold tracking-tight ${theme.tag} dark:text-blue-300`}>
                                {theme.category}
                              </span>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                {onEditCellSubject && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditCellSubject(cell);
                                    }}
                                    title="과목명 직접 수정"
                                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickAddHomework(cell);
                                  }}
                                  title="이 수업에 과제 등록"
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-white dark:hover:bg-slate-700 rounded transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                              {subject}
                            </div>

                            {cellHws.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {pendingHws.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded shadow-xs">
                                    <Clock className="w-2.5 h-2.5" />
                                    과제 {pendingHws.length}건
                                  </span>
                                )}
                                {completedHws.length > 0 && pendingHws.length === 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    완료됨
                                  </span>
                                )}
                              </div>
                            )}

                            {cellHws.length === 0 && (
                              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5 no-print">
                                <Plus className="w-3 h-3" />
                                <span>과제 등록</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[78px] rounded-lg p-2.5 border border-dashed border-slate-200 dark:border-slate-800 text-center flex items-center justify-center text-xs text-slate-400">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
