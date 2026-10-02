import React, { useState, useEffect } from 'react';
import { Bell, Volume2, Clock, Sparkles } from 'lucide-react';
import { PERIOD_SCHEDULE } from '../services/neisConstants';
import { TimetableCell } from '../types';

interface LiveBellWidgetProps {
  todayCells: TimetableCell[];
}

// 웹 오디오 API를 이용한 학교 종소리 (학교 차임벨 4음 합성음)
function playSchoolChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [
      { f: 523.25, time: 0.0, dur: 0.6 }, // Do
      { f: 659.25, time: 0.5, dur: 0.6 }, // Mi
      { f: 587.33, time: 1.0, dur: 0.6 }, // Re
      { f: 392.00, time: 1.5, dur: 0.9 }, // Sol
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + n.time);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + n.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.time);
      osc.stop(ctx.currentTime + n.time + n.dur);
    });
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

export const LiveBellWidget: React.FC<LiveBellWidgetProps> = ({ todayCells }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  // 대진전자통신고 실제 일과: 월·수 7교시, 화·목·금 6교시 후 일과 종료
  const isSixPeriodDay = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 5;
  const dayEndMinutes = isSixPeriodDay ? 15 * 60 + 30 : 16 * 60 + 30;

  // 현재 시간 기반 교시 및 남은 시간 계산
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  let statusText = '';
  let subText = '';
  let highlightSubject = '';
  let badgeColor = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';

  if (isWeekend) {
    statusText = '주말 휴식 시간';
    subText = '평일 등교 시간(08:40)에 맞추어 실시간 교시 타이머가 작동합니다.';
  } else if (currentMinutes < 9 * 60) {
    const diffMin = 9 * 60 - currentMinutes;
    statusText = '등교 및 조회 시간';
    subText = `1교시 시작(09:00)까지 ${diffMin}분 남았습니다.`;
    const p1 = todayCells.find((c) => c.period === 1);
    if (p1) highlightSubject = `1교시: ${p1.subject}`;
  } else if (currentMinutes >= dayEndMinutes) {
    statusText = '방과 후 / 하교 시간';
    subText = `오늘의 모든 정규 수업(${isSixPeriodDay ? '6' : '7'}교시)이 종료되었습니다. 즐거운 방과후 보내세요!`;
  } else {
    // 일과 시간 내부
    let found = false;
    for (const schedule of PERIOD_SCHEDULE) {
      if (isSixPeriodDay && schedule.period === 7) continue;

      const [sh, sm] = schedule.start.split(':').map(Number);
      const [eh, em] = schedule.end.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (currentMinutes >= startMin && currentMinutes < endMin) {
        found = true;
        const remainMin = endMin - currentMinutes - 1;
        const remainSec = 59 - currentSeconds;

        if (schedule.period === 0) {
          statusText = '즐거운 점심시간';
          subText = `5교시 시작(13:40)까지 ${remainMin}분 ${remainSec}초 남음`;
          badgeColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        } else {
          statusText = `현재 ${schedule.period}교시 진행 중`;
          const cell = todayCells.find((c) => c.period === schedule.period);
          if (cell) highlightSubject = cell.subject;
          subText = `수업 종료(${schedule.end})까지 ${remainMin}분 ${remainSec}초 남음`;
        }
        break;
      }
    }

    if (!found) {
      // 쉬는 시간
      statusText = '쉬는 시간 (휴식 및 교재 준비)';
      badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

      // 다음 교시 찾기
      const nextSchedule = PERIOD_SCHEDULE.find((s) => {
        const [sh, sm] = s.start.split(':').map(Number);
        return sh * 60 + sm > currentMinutes;
      });

      if (nextSchedule) {
        const [sh, sm] = nextSchedule.start.split(':').map(Number);
        const remainMin = sh * 60 + sm - currentMinutes - 1;
        const remainSec = 59 - currentSeconds;
        const nextCell = todayCells.find((c) => c.period === nextSchedule.period);
        subText = `다음 ${nextSchedule.label}(${nextSchedule.start})까지 ${remainMin}분 ${remainSec}초 남음`;
        if (nextCell) highlightSubject = `다음 수업: ${nextCell.subject}`;
      } else {
        subText = '오늘 수업이 모두 끝났습니다.';
      }
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 animate-pulse" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-md border ${badgeColor}`}
            >
              {statusText}
            </span>
            {highlightSubject && (
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {highlightSubject}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {subText}
          </p>
        </div>
      </div>

      {/* 우측 종소리 재생 버튼 */}
      <button
        type="button"
        onClick={playSchoolChime}
        title="학교 종소리 미리듣기 (합성음)"
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
      >
        <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>종소리 울리기</span>
      </button>
    </div>
  );
};
