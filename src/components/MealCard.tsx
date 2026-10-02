import React, { useState, useEffect } from 'react';
import { Utensils, Flame, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { MealDietInfo } from '../types';
import { fetchDailyMeal } from '../services/neisApi';

interface MealCardProps {
  apiKey?: string;
}

export const MealCard: React.FC<MealCardProps> = ({ apiKey }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealInfo, setMealInfo] = useState<MealDietInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadMeal = async (date: Date) => {
    setIsLoading(true);
    try {
      const data = await fetchDailyMeal(date, apiKey);
      setMealInfo(data);
    } catch (e) {
      console.warn('Failed to load meal:', e);
      setMealInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeal(selectedDate);
  }, [selectedDate, apiKey]);

  const changeDay = (diff: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + diff);
    setSelectedDate(next);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday =
    selectedDate.getFullYear() === new Date().getFullYear() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getDate() === new Date().getDate();

  const formattedDate = selectedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
      {/* 헤더 및 날짜 선택 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>대진전자통신고 급식 식단표</span>
              {isToday && (
                <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                  오늘의 식단
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">나이스(NEIS) 학교급식정보 실시간 연동</p>
          </div>
        </div>

        {/* 날짜 제어 컨트롤 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => changeDay(-1)}
            title="이전 날"
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg tabular-nums">
            {formattedDate}
          </span>

          <button
            type="button"
            onClick={() => changeDay(1)}
            title="다음 날"
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={jumpToToday}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors ml-1"
            >
              오늘
            </button>
          )}

          <button
            type="button"
            onClick={() => loadMeal(selectedDate)}
            disabled={isLoading}
            title="새로고침"
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 식단 본문 */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full mb-2" />
          <p className="text-xs text-slate-500">나이스에서 식단 정보를 받아오고 있습니다...</p>
        </div>
      ) : mealInfo && mealInfo.dishes.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {mealInfo.mealName}
            </span>
            {mealInfo.calories && (
              <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded border border-amber-200/60 dark:border-amber-800 tabular-nums">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {mealInfo.calories}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {mealInfo.dishes.map((dish, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 rounded-lg p-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{dish}</span>
              </div>
            ))}
          </div>

          {mealInfo.originInfo && (
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
              <span className="font-semibold text-slate-600 dark:text-slate-300">원산지 정보:</span> {mealInfo.originInfo}
            </div>
          )}
        </div>
      ) : (
        <div className="py-10 text-center text-slate-400 dark:text-slate-500">
          <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">해당 날짜에 등록된 급식 식단이 없습니다.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            주말, 공휴일 또는 방학 기간에는 급식 정보가 제공되지 않습니다.
          </p>
        </div>
      )}
    </div>
  );
};
