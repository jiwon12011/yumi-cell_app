import { useCallback, useEffect, useState } from 'react';

export type Tab = 'today' | 'village' | 'calendar' | 'stats';

export interface ViewState {
  tab: Tab;
  /** 오늘 탭이 편집 중인 날짜 (과거 소급 기록 시 오늘이 아닐 수 있음) */
  editingDate: string | null;
  /** true면 오늘 탭에서 폼 대신 리액션 화면 */
  showReaction: boolean;
  /** 달력 위 바텀시트가 열린 날짜 */
  sheetDate: string | null;
}

const DEEP_LINK = /^#\/d\/(\d{4}-\d{2}-\d{2})$/;

export function parseDeepLink(hash: string): string | null {
  const m = DEEP_LINK.exec(hash);
  return m ? m[1] : null;
}

/**
 * 뷰 상태 + 해시 딥링크(#/d/YYYY-MM-DD) 동기화 (기획서 §3).
 * 딥링크 진입 → 달력 탭 + 해당 날짜 시트. 시트 열림/닫힘에 따라 해시 갱신.
 */
export function useView() {
  const [view, setView] = useState<ViewState>(() => {
    const linked = typeof location !== 'undefined' ? parseDeepLink(location.hash) : null;
    return {
      tab: linked ? 'calendar' : 'today',
      editingDate: null,
      showReaction: false,
      sheetDate: linked,
    };
  });

  // 뒤로가기 등 외부 해시 변경 반영
  useEffect(() => {
    const onHash = () => {
      const linked = parseDeepLink(location.hash);
      setView((v) =>
        linked
          ? { ...v, tab: 'calendar', sheetDate: linked }
          : v.sheetDate
            ? { ...v, sheetDate: null }
            : v,
      );
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const setTab = useCallback((tab: Tab) => {
    setView((v) => ({ ...v, tab, sheetDate: null, editingDate: null }));
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }, []);

  const openSheet = useCallback((date: string) => {
    setView((v) => ({ ...v, tab: 'calendar', sheetDate: date }));
    history.replaceState(null, '', `#/d/${date}`);
  }, []);

  const closeSheet = useCallback(() => {
    setView((v) => ({ ...v, sheetDate: null }));
    history.replaceState(null, '', location.pathname + location.search);
  }, []);

  /** 특정 날짜(오늘 포함)의 기록 폼 열기 */
  const openForm = useCallback((date: string | null) => {
    setView((v) => ({ ...v, tab: 'today', editingDate: date, showReaction: false, sheetDate: null }));
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }, []);

  const showReactionFor = useCallback((date: string | null) => {
    setView((v) => ({ ...v, tab: 'today', editingDate: date, showReaction: true, sheetDate: null }));
  }, []);

  return { view, setTab, openSheet, closeSheet, openForm, showReactionFor };
}
