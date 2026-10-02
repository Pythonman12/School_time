import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Bookmark, CheckCircle2, Trash2 } from 'lucide-react';
import { HomeworkItem, TimetableCell, HomeworkCategory, HomeworkPriority } from '../types';

interface HomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<HomeworkItem, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialCell?: TimetableCell | null;
  editingHomework?: HomeworkItem | null;
  grade: number;
  classNum: number;
  department: string;
}

export const HomeworkModal: React.FC<HomeworkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCell,
  editingHomework,
  grade,
  classNum,
  department,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<HomeworkCategory>('과제/숙제');
  const [priority, setPriority] = useState<HomeworkPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [period, setPeriod] = useState<number | undefined>(undefined);
  const [dateStr, setDateStr] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsConfirmingDelete(false);

    if (editingHomework) {
      setTitle(editingHomework.title);
      setSubject(editingHomework.subject);
      setCategory(editingHomework.category);
      setPriority(editingHomework.priority);
      setDueDate(editingHomework.dueDate);
      setPeriod(editingHomework.period);
      setDateStr(editingHomework.dateStr);
      setDescription(editingHomework.description);
      setIsCompleted(editingHomework.isCompleted);
    } else if (initialCell) {
      setTitle('');
      setSubject(initialCell.subject || '');
      setCategory('과제/숙제');
      setPriority('medium');
      setPeriod(initialCell.period);
      setDateStr(initialCell.dateStr);
      setDescription('');
      setIsCompleted(false);

      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 7);
      const y = defaultDue.getFullYear();
      const m = String(defaultDue.getMonth() + 1).padStart(2, '0');
      const d = String(defaultDue.getDate()).padStart(2, '0');
      setDueDate(`${y}-${m}-${d}`);
    } else {
      setTitle('');
      setSubject('');
      setCategory('과제/숙제');
      setPriority('medium');
      setPeriod(undefined);
      setDateStr(undefined);
      setDescription('');
      setIsCompleted(false);

      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 3);
      const y = defaultDue.getFullYear();
      const m = String(defaultDue.getMonth() + 1).padStart(2, '0');
      const d = String(defaultDue.getDate()).padStart(2, '0');
      setDueDate(`${y}-${m}-${d}`);
    }
  }, [isOpen, initialCell, editingHomework]);

  if (!isOpen) return null;

  const setQuickDue = (daysToAdd: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysToAdd);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setDueDate(`${y}-${m}-${d}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingHomework?.id,
      title: title.trim(),
      subject: subject.trim() || '일반 과제',
      category,
      priority,
      dueDate,
      grade,
      classNum,
      department,
      period,
      dateStr,
      description: description.trim(),
      isCompleted,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {editingHomework ? '과제 수정하기' : '새 과제 등록'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              대진전자통신고 {grade}학년 {classNum}반 ({department})
              {initialCell && ` · ${initialCell.dayName}요일 ${initialCell.period}교시`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 폼 본문 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              관련 과목 <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 컴퓨터 구조, 사물 인터넷, 공통수학1"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              과제 / 수행평가 제목 <span className="text-blue-600 dark:text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 아두이노 온습도 센서 실습 보고서 작성"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                과제 구분
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HomeworkCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 font-medium"
              >
                <option value="과제/숙제">과제 / 숙제</option>
                <option value="수행평가">수행평가 (점수반영)</option>
                <option value="시험대비">시험 대비 / 복습</option>
                <option value="준비물">수업 준비물</option>
                <option value="기타">기타 메모</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as HomeworkPriority)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 font-medium"
              >
                <option value="low">낮음 (여유 있음)</option>
                <option value="medium">보통 (일반 과제)</option>
                <option value="high">긴급 (중요 / 기한 촉박)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                제출 마감일 <span className="text-blue-600 dark:text-blue-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickDue(1)}
                  className="px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  내일
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDue(3)}
                  className="px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  3일 뒤
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDue(7)}
                  className="px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  다음 주
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              세부 내용 및 제출 방법 (선택)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 구글 클래스룸에 회로 사진 및 소스코드 첨부하여 제출할 것. 5페이지 양식 준수."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {editingHomework && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isCompletedCheck"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700 focus:ring-blue-500"
              />
              <label htmlFor="isCompletedCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                이미 완료한 과제입니다.
              </label>
            </div>
          )}

          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg p-2.5 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Bookmark className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              등록된 과제는 브라우저 <strong>로컬 스토리지(localStorage)</strong>에 안전하게 즉시 보관되며, 언제든 과제함에서 확인하고 완료 체크할 수 있습니다.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            {editingHomework && onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(editingHomework.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    정말 삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  과제 삭제
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {editingHomework ? '과제 변경 저장' : '과제 등록'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
