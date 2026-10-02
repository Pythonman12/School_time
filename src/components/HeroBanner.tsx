import React from 'react';
import { ExternalLink, Sparkles, School, CheckCircle2 } from 'lucide-react';
import { NEIS_CONFIG } from '../services/neisConstants';

interface HeroBannerProps {
  grade: number;
  classNum: number;
  department: string;
  onOpenNeisModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  grade,
  classNum,
  department,
  onOpenNeisModal,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white shadow-xs">
      {/* 배경 이미지 및 오버레이 스크림 */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_daejin_school_1790928319319.jpg"
          alt="대진전자통신고등학교 실습실 배너"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30"
          onError={(e) => {
            // zero-broken-image fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-900/80" />
      </div>

      {/* 배너 콘텐츠 */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-300">
            <span className="font-semibold">{NEIS_CONFIG.OFFICE_NAME}</span>
            <span aria-hidden="true">·</span>
            <span>{NEIS_CONFIG.SCHOOL_TYPE}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              나이스(NEIS) 실시간 API 연동
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-balance">
            {NEIS_CONFIG.SCHOOL_NAME} 시간표 &amp; 과제 관리
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            나이스 교육정보 개방포털 실시간 고등학교 시간표를 조회하고, 원하는 교시를 클릭하여 과제 및 수행평가를 로컬 스토리지에 즉시 등록·관리하세요.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
            <span>현재 설정: <strong className="text-white">{grade}학년 {classNum}반 ({department})</strong></span>
            <span aria-hidden="true">·</span>
            <span>교시 클릭 시 과제 등록 지원</span>
          </div>
        </div>

        {/* 우측 연동 출처 버튼 */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
          <a
            href="https://open.neis.go.kr/portal/data/service/selectServicePage.do?page=1&rows=10&sortColumn=&sortDirection=&infId=OPEN18620200826103326268120&infSeq=2"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg transition-colors"
          >
            <span>나이스 고등학교 시간표 포털</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={onOpenNeisModal}
            className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            학교 정보 및 API 설정 보기
          </button>
        </div>
      </div>
    </div>
  );
};
