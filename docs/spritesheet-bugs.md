# Spritesheet Feature Bug Report

> 분석일: 2026-03-17
> 관련 파일: `skin-manager.ts`, `Settings.tsx`, `Character.tsx`, `types.ts`

---

## CRITICAL (기능 동작 불가)

### BUG-01: frameWidth / frameHeight가 계산되지 않음

**파일:** `src/main/skin-manager.ts:28-53`, `src/renderer/pages/Settings.tsx:50-51`

**증상:** 스프라이트시트 모드에서 캐릭터가 올바르게 렌더링되지 않음 (이미지가 깨지거나 빈 화면)

**원인:**
- `types.ts:114-115`에 `frameWidth`와 `frameHeight`가 정의되어 있고, 주석에 "calculated at upload time"이라고 명시되어 있음
- 그러나 `uploadSkinImage()` 함수는 **파일 경로만 반환**하고 이미지의 `naturalWidth`/`naturalHeight`를 읽지 않음
- `Settings.tsx:50-51`에서 업로드 후 `spritesheet` 객체를 업데이트할 때 `imagePath`만 설정함:
  ```typescript
  newConfig.spritesheet = { ...newConfig.spritesheet!, imagePath: filePath };
  ```
- `frameWidth`와 `frameHeight`가 설정되지 않으므로 `undefined`로 남음

**영향:**
- `Character.tsx:224`에서 `objectPosition: ${-frame.col * frameWidth}px ${-frame.row * frameHeight}px`가 `NaN px NaN px`로 계산됨
- `width: frameWidth`, `height: frameHeight`도 `undefined`가 되어 이미지 크기가 0이 됨
- **스프라이트시트 기능이 사실상 완전히 작동하지 않음**

**수정 방향:**
- `uploadSkinImage()`에서 이미지를 로드하여 dimensions를 반환하거나
- Settings.tsx에서 업로드 후 `Image` 객체로 dimensions를 읽어 `frameWidth = naturalWidth / columns`, `frameHeight = naturalHeight / rows`를 계산

---

### BUG-02: 스프라이트시트 초기 설정 시 non-null assertion 크래시

**파일:** `src/renderer/pages/Settings.tsx:51`

**증상:** 스프라이트시트 모드 선택 후 첫 이미지 업로드 시 런타임 에러 발생 가능

**원인:**
```typescript
newConfig.spritesheet = { ...newConfig.spritesheet!, imagePath: filePath };
```
- `skinConfig.spritesheet`가 `undefined`인 상태에서 `!` (non-null assertion)으로 spread하면 `undefined`를 spread하게 됨
- JavaScript에서 `...undefined`는 에러가 아니지만, 결과 객체에 `columns`, `rows`, `frameWidth`, `frameHeight`, `moodMap`이 모두 누락됨
- 이후 `columns`, `rows` 접근 시 `undefined`가 되어 UI가 비정상 동작

**영향:**
- 첫 업로드 후 columns/rows 입력 필드에 `NaN` 표시
- moodMap이 없어 프레임 매핑이 완전히 누락됨

---

## HIGH (주요 기능 결함)

### BUG-03: moodMap 초기값 누락

**파일:** `src/renderer/pages/Settings.tsx:50-53`

**증상:** 스프라이트시트 이미지 업로드 후 mood-frame 매핑이 비어있음

**원인:**
- 이미지 업로드 시 `moodMap`에 대한 초기값이 설정되지 않음
- `skinConfig.spritesheet`가 없는 상태에서 spread하면 `moodMap`이 `undefined`
- `Character.tsx:217`에서 `moodMap[expression]`이 `undefined`를 반환하여 **어떤 mood도 렌더링되지 않음**

**수정 방향:**
- 업로드 시 모든 expression에 대해 `{ col: 0, row: 0 }` 기본값으로 moodMap 초기화 필요

---

### BUG-04: columns/rows 변경 시 frameWidth/frameHeight 미갱신

**파일:** `src/renderer/pages/Settings.tsx:299-314`

**증상:** columns/rows를 변경해도 프레임 크기가 업데이트되지 않음

**원인:**
```typescript
saveSkinConfig({ ...skinConfig, spritesheet: { ...skinConfig.spritesheet!, columns: cols } });
```
- columns나 rows 값이 변경되면 `frameWidth = imageWidth / columns`, `frameHeight = imageHeight / rows`도 재계산해야 함
- 그러나 이 재계산 로직이 어디에도 존재하지 않음
- BUG-01과 연결: frameWidth/frameHeight 계산 로직 자체가 없음

---

### BUG-05: 프레임 좌표 범위 검증 없음

**파일:** `src/renderer/pages/Settings.tsx:327-348`

**증상:** col/row에 그리드 범위를 초과하는 값 입력 가능 → 이미지 외 영역이 표시됨

**원인:**
- col 입력의 max가 `15`로 하드코딩되어 있지만, 실제 columns 값과 무관
- 예: columns=3인데 col=10을 입력할 수 있음
- HTML `max` 속성은 브라우저에서 강제하지 않음 (수동 입력으로 우회 가능)

**영향:**
- `objectPosition`이 이미지 범위 밖을 가리켜 빈 공간이 표시됨

**수정 방향:**
- col max를 `columns - 1`, row max를 `rows - 1`로 동적 설정
- onChange에서 clamp 로직 추가

---

## MEDIUM (사용성 문제)

### BUG-06: Windows 파일 경로의 file:// 프로토콜 처리

**파일:** `src/renderer/components/Character.tsx:219`, `src/renderer/pages/Settings.tsx:227,255,280`

**증상:** Windows 환경에서 스킨 이미지가 로드되지 않을 수 있음

**원인:**
```typescript
imgSrc = `file://${imagePath}`;
// 결과: file://C:\Users\test\... (백슬래시)
```
- Windows 경로의 백슬래시(`\`)가 `file://` URI에서 올바르게 처리되지 않을 수 있음
- 정확한 형식: `file:///C:/Users/test/...` (슬래시 3개 + 포워드 슬래시)

**영향:**
- Electron의 Chromium은 대부분 관대하게 처리하지만, 일부 edge case에서 이미지 로드 실패 가능

**수정 방향:**
- `imagePath.replace(/\\/g, '/')` 적용 및 `file:///` 사용

---

### BUG-07: 업로드 실패 시 사용자 피드백 없음

**파일:** `src/renderer/pages/Settings.tsx:41-54`, `src/main/skin-manager.ts:40-43`

**증상:** 이미지 업로드 실패 시 아무 반응 없음

**원인:**
- `uploadSkinImage()`가 파일 크기 초과(2MB), 지원하지 않는 확장자 등의 이유로 `null`을 반환
- `handleSkinUpload()`에서 `if (!filePath) return;`으로 조용히 무시
- 사용자는 왜 업로드가 안 되는지 알 수 없음

**수정 방향:**
- 실패 사유별 에러 메시지 반환 (예: `{ error: 'FILE_TOO_LARGE' }`)
- UI에 토스트 또는 인라인 에러 표시

---

### BUG-08: 모드 전환 시 이전 설정이 잔류

**파일:** `src/renderer/pages/Settings.tsx:36-38`

**증상:** spritesheet → single → spritesheet 전환 시 이전 설정이 그대로 남아있음

**원인:**
```typescript
const handleSkinModeChange = async (mode: SkinMode) => {
  const newConfig = { ...skinConfig, mode };  // 다른 필드를 제거하지 않음
  await saveSkinConfig(newConfig);
};
```
- 모드 변경 시 관련 없는 설정(spritesheet, singleImagePath, moodImages)이 정리되지 않음

**영향:**
- 다른 모드의 이미지 파일이 `cleanupOldSkins`에서 삭제되지 않음 (keepPaths에 포함)
- 사용자 혼란: 이전 설정이 예상치 않게 복원됨

---

### BUG-09: spritesheet CSS가 기본 imgStyle과 충돌

**파일:** `src/renderer/components/Character.tsx:249-258`

**증상:** 스프라이트시트 프레임이 올바르게 잘리지 않을 수 있음

**원인:**
```typescript
const imgStyle: CSSProperties = {
  width: '100%',      // 기본: 부모 컨테이너 크기
  height: '100%',
  objectFit: 'contain',  // 기본: contain
  ...(spriteStyle ?? {}), // spritesheet: objectFit: 'none', width: frameWidth, height: frameHeight
};
```
- spriteStyle이 기본 스타일을 override하지만:
  - `width: frameWidth` (number)가 `width: '100%'` (string)을 대체 → `width: 0` (frameWidth가 undefined인 경우)
  - 부모 컨테이너(`containerStyle`)는 `width: 60, height: 60`으로 고정 → 프레임이 60x60에 맞춰 잘릴 수 있음
  - `objectFit: 'none'`과 고정 컨테이너가 결합되면 overflow 처리가 필요하지만 `overflow: hidden`이 설정되어 있지 않음

---

## LOW (개선 권장)

### BUG-10: 스프라이트시트 프리뷰에서 실제 프레임 미리보기 불가

**파일:** `src/renderer/pages/Settings.tsx:278-290`

**증상:** 설정 UI에서 전체 스프라이트시트 이미지만 보이고, 개별 프레임이 어떻게 잘리는지 확인 불가

**설명:**
- 현재 프리뷰는 전체 이미지를 축소하여 보여줌
- 사용자가 col/row 매핑이 올바른지 시각적으로 확인할 방법이 없음
- 특히 큰 스프라이트시트에서 어떤 프레임이 어떤 mood에 매핑되는지 직관적으로 파악하기 어려움

---

### BUG-11: `sleeping` 필터가 스프라이트시트에도 적용됨

**파일:** `src/renderer/components/Character.tsx:254`

**증상:** sleeping mood의 스프라이트시트 프레임에 불필요한 brightness/saturate 필터 적용

**원인:**
```typescript
...(expression === 'sleeping' ? { filter: 'brightness(0.85) saturate(0.7)', opacity: 0.8 } : {}),
```
- 이 필터는 기본 캐릭터용이지만, 커스텀 스프라이트시트에도 동일하게 적용됨
- 사용자가 이미 sleeping 전용 프레임을 만들었다면 필터가 이중 적용되는 효과

---

## 버그 요약

| ID | 심각도 | 제목 | 상태 |
|------|---------|------|------|
| BUG-01 | CRITICAL | frameWidth/frameHeight 미계산 | 수정됨 |
| BUG-02 | CRITICAL | 초기 설정 시 non-null assertion 크래시 | 수정됨 |
| BUG-03 | HIGH | moodMap 초기값 누락 | 수정됨 |
| BUG-04 | HIGH | columns/rows 변경 시 frameWidth/frameHeight 미갱신 | 수정됨 |
| BUG-05 | HIGH | 프레임 좌표 범위 검증 없음 | 수정됨 |
| BUG-06 | MEDIUM | Windows file:// 경로 처리 | 수정됨 |
| BUG-07 | MEDIUM | 업로드 실패 시 피드백 없음 | 수정됨 |
| BUG-08 | MEDIUM | 모드 전환 시 설정 잔류 | 수정됨 |
| BUG-09 | MEDIUM | CSS 스타일 충돌 | 수정됨 |
| BUG-10 | LOW | 프레임 프리뷰 미지원 | 수정됨 |
| BUG-11 | LOW | sleeping 필터 이중 적용 | 수정됨 |

> **핵심 문제:** BUG-01~04는 서로 연결되어 있으며, 스프라이트시트 기능이 **사실상 완전히 동작하지 않는** 상태임. 이미지 dimensions 계산 로직과 초기값 설정이 전혀 구현되지 않았음.
