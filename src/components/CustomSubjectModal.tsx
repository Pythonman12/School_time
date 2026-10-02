import React, { useState, useEffect } from 'react';
import { X, Edit3, RotateCcw } from 'lucide-react';
import { TimetableCell } from '../types';

interface CustomSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: TimetableCell | null;
  onSave: (customKey: string, newSubject: string) => void;
  grade: number;
  classNum: number;
}

export const CustomSubjectModal: React.FC<CustomSubjectModalProps> = ({
  isOpen,
  onClose,
  cell,
  onSave,
  grade,
  classNum,
}) => {
  const [subjectInput, setSubjectInput] = useState('');

  useEffect(() => {
    if (cell) {
      setSubjectInput(cell.subject || '');
    }
  }, [cell]);

  if (!isOpen || !cell) return null;

  const cellKey = `${grade}_${classNum}_${cell.dateStr}_${cell.period}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cellKey, subjectInput.trim());
    onClose();
  };

  const handleResetToNeis = () => {
    onSave(cellKey, ''); // 빈 문자열 전달 시 커스텀 삭제되어 나이스 원본으로 복원
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              수업 과목명 직접 수정
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            대진전자통신고 {grade}학년 {classNum}반 · {cell.dayName}요일 {cell.period}교시 ({cell.timeRange})
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              과목명 및 교실 (자유 입력)
            </label>
            <input
              type="text"
              required
              autoFocus
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="예: AI 실습 (302호), 자율동아리, 프로그래밍 보충"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            직접 수정한 과목명은 브라우저 로컬 저장소에 보관되며, 언제든 '나이스 원본 복원'을 눌러 교육청 공식 시간표로 되돌릴 수 있습니다.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {cell.isCustom ? (
              <button
                type="button"
                onClick={handleResetToNeis}
                className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                나이스 원본 복원
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
