# Streak Calendar Design Spec

**Date:** 2026-03-14

## Goal
Settings 페이지의 현재 상태 카드에 GitHub 스타일 잔디밭 캘린더 + 스트릭 카운터를 추가한다. 각 셀은 해당 일의 무드 색상으로 표시.

## Design
- **위치:** Settings → Current Status 카드, 상태 정보 아래
- **스트릭 카운터:** "🔥 N일 연속" (dailyHistory에서 최근 연속 percent > 0 일수)
- **잔디밭 그리드:** 최근 30일, 6열 × 5행, 최신이 우측 하단
- **색상:** angry=#ef4444, worried=#eab308, happy=#22c55e, proud=#f59e0b, 미사용=#e5e7eb, 없음=#f3f4f6
- **무드 계산:** 일별 percent로 단일축 fallback (< 25% angry, 25-60% worried, 60-85% happy, 85%+ proud)
- **범례:** 색상 점 4개 + 라벨

## Data Flow
- dailyHistory를 renderer에 전달 (IPC: DAILY_HISTORY_GET)
- Settings에서 마운트 시 조회

## Files
- `src/shared/types.ts` — IPC channel 추가
- `src/main/ipc-handlers.ts` — dailyHistory 핸들러
- `src/main/preload.ts` — bridge
- `src/renderer/electron.d.ts` — type
- `src/renderer/pages/Settings.tsx` — 잔디밭 렌더링
- `src/shared/i18n.ts` — streak 관련 문자열
