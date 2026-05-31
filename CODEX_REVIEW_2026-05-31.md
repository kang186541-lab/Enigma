# Codex Review — 세션 작업 (2026-05-31)

> 이 세션에서 만든 모든 변경의 리뷰 가이드. Codex/리뷰어용.
> **리뷰 범위(diff):** `9d5181d..40ad4a1` — 5 커밋, 6 파일, +86 / −48.
> **상태:** 전부 커밋·푸시 완료. `origin/main = 40ad4a1`, working tree clean(dirty 0).
> **검증 베이스라인:** `npm run verify:quality` exit 0 (0 errors, 47 기존 warnings) · `npx tsx scripts/verify-speaking-core.ts` GREEN · 라이브 https://web-dist2.vercel.app → HTTP 200.

빠른 리뷰 명령:
```bash
# 세션 전체 diff
git diff 9d5181d..40ad4a1
# 커밋별
git show c4f62d5   # fill-blank 힌트 + boss-spell
git show e48d8f3   # Babel 인사 답키
git show f4b5f0a   # Madrid 색/감정 힌트
git show b2e6a86   # 스토리 선택 레이아웃
git show 40ad4a1   # Rudy guide 드립 (로직 밀도 ↑ — 집중 리뷰 권장)
# 게이트 재실행
npm run verify:quality && npx tsx scripts/verify-speaking-core.ts
```

---

## 주제별 개요
이 세션은 두 갈래: **(A) 스토리 모드 힌트 언어호환 마무리 + UI**, **(B) Rudy guide 데일리 드립 감사·수정**.
공통 모델: 힌트는 두 축(`uiLang` 읽기언어 vs `learningLang` 학습언어)으로 갈림. `resolveHint(h, uiLang, learningLang)` + `HintTri = Tri & { byLearning?: Partial<Record<string, Tri>> }`. `verify-speaking-core.ts`는 LOCKED 가드레일이며 매 변경 GREEN 유지.

---

## 1) `c4f62d5` — fill-blank 퍼즐 힌트 언어호환 + boss-spell 동적 힌트
**파일:** `app/story-scene.tsx` (+12/−?), `components/story/puzzles/BossSpellPuzzle/index.tsx` (+17)

**무엇/왜**
- **근본 버그:** `FillBlankPuzzle`(story-scene.tsx ~L5335)가 힌트를 `tri(qHints.h, lang)` — **uiLang만** 써서 `learningLang`을 무시 → 영어 외 학습자에게 "답: near" 같은 **영어 오답**을 표시. 다른 퍼즐들은 공유 경로(L7332)에서 이미 `resolveHint(learningLang)`을 썼고, fill-blank만 누락이었음.
  - 수정: `FillBlankQ.hints` 타입 `Tri`→`HintTri`로 위든(L102), 렌더러 3줄 `tri(...)`→`resolveHint(qHints.h, lang, learningLang)`.
  - 데이터: near/midnight(Cairo) `h3`에 `byLearning`(korean/spanish/indonesian) 추가 → 학습언어별 정답 단어(근처에/cerca de/dekat). base Tri는 영어 학습자용.
- **boss-spell drift 버그:** 최종 힌트(h3)가 손으로 복사한 정답문장이라 `buildSpell`과 어긋날 수 있었음 → `spellText`(= `buildSpell(spellChunks, separators)`)에서 **동적 생성**(단일 소스) + indonesian 분기 추가.

**리뷰 포커스**
- `resolveHint` 폴백: `byLearning[learningLang] ?? base`, uiLang=indonesian일 때 `id ?? en`.
- `HintTri` 위든이 다른 `FillBlankQ` 사용처를 깨지 않는지 (타입은 상위호환).
- BossSpell `hintText` useMemo의 dep 배열에 `spellText` 포함됐는지.

---

## 2) `e48d8f3` — Babel 인사 매칭 답키 힌트 byLearning
**파일:** `app/story-scene.tsx` (1줄 → byLearning 4키로 확장)

**무엇/왜:** Babel word-match 답키 h3("Hello=인사 / Help me=…")가 영어 어휘 고정 → 학습언어별 단어가 바뀌는데 힌트는 영어. word-match는 공유 경로(resolveHint)라 **렌더러는 정상, 데이터만 결손** → `byLearning`(english/korean/spanish/indonesian) 추가. **퍼즐의 실제 단어 Tri 문자열을 그대로 슬롯팅**(안녕하세요/Hola/Halo)해 번역 지어내지 않음. 분류 라벨은 uiLang 유지.

**리뷰 포커스:** 슬롯된 6개 단어 × 4 학습언어가 퍼즐 정의(L657–702)와 일치하는지. (번역 검수 에이전트 통과.)

---

## 3) `f4b5f0a` — Madrid 색/감정 word-match 힌트 byLearning (조사-안전)
**파일:** `app/story-scene.tsx` (2줄: L3457 h2, L3458 h3)

**무엇/왜:** red/color·happy/beautiful 힌트가 영어 어휘 참조. 단순 치환 시 **한국어 조사 일치 깨짐**(빨간색**과** vs red**와**) → **조사-중립 구성** 사용: `"빨간색, 색 같은 단어는…"`(는이 명사 '단어'에), `"감정: X / 묘사: Y"`(콜론, 조사 없음). 퍼즐 단어 문자열 재사용.

**리뷰 포커스:** 한국어 조사 안전성, es/id 자연스러움. (번역 검수 에이전트 "No issues found".)

---

## 4) `b2e6a86` — 스토리 선택 화면 레이아웃 de-cramp
**파일:** `app/(tabs)/story.tsx` (+9/−10)

**무엇/왜:** 고정 헤더 스택(Rudy 배너 + 빠른액션 + 캠프힌트)이 챕터 리스트를 아래로 밀어 "주저앉은" 화면. → `lingoBanner`/`quickActions`/`campHint`를 **ScrollView 안으로 이동**(함께 스크롤), Rudy 마스코트 **100→64**, 카드 컴팩트(카드 간 gap 16→14, `cardGradient` padding 20→18). 제목 헤더만 고정.

**리뷰 포커스**
- JSX 중첩: `<ScrollView>`가 banner/actions/campHint/`<View styles.scroll>`(카드 래퍼)를 감싸고 닫힘 — 균형 확인.
- ScrollView `contentContainerStyle`은 `paddingBottom`만(full-bleed 배너/액션 위해), 카드 가로 패딩은 래퍼 View로 이동.
- ⚠️ **라이브 시각 검증 미실시**(Expo 앱 구동 부담). 빌드·tsc·구조는 검증됨. 카드 JSX 들여쓰기는 재정렬 안 함(동작 무관, cosmetic). **리뷰어가 실기기/웹에서 눈으로 확인 권장.**

---

## 5) `40ad4a1` — Rudy guide 데일리 드립: 버그 수정 + 게이트 제거 + 가드레일 강화
**파일:** `app/(tabs)/index.tsx` (+? ), `components/RudyGuideModal.tsx` (+36/−?), `scripts/verify-speaking-core.ts` (+20)
**배경:** 에이전트 3명 감사(데이터/로직-적대/스펙-가드레일). 데이터·스펙 모두 준수 + GREEN이었으나 적대 감사가 실버그 + 제품 이슈 + 가드레일 공백을 발견.

**무엇/왜**
- **버그(카드-인덱스 디커플링):** 모달이 `useState(0)`로 카드0을 먼저 렌더 후 비동기로 진짜 카드 교체, 그리고 `advanceGuideIndex`가 화면 `cardIdx`가 아니라 **스토리지를 재read**해 +1. → (a) idx>0 사용자에 **카드0 깜빡**, (b) 비동기 갭 빠른탭 또는 마일스톤 동시쓰기 시 **본 적 없는 카드로 전진(skip)**.
  - 수정: Home이 `getNextGuideIndex()` 결과를 `guideIndex` state로 잡아 `cardIndex` **prop으로 전달**, 모달은 그 카드만 렌더(없으면 null, 플래시 제거)하고 `advanceGuideIndex(cardIndex)`로 **본 카드 기준 전진**(단일 소스). `advanceGuideIndex(shownIndex?)`는 하위호환 유지.
- **게이트 제거(제품 오너 지시):** 기존 `if (spokenToday<=0) setShowGuide(false)` → 말하기 1문장 이후에만 카드가 떠서 ①비발화자는 영영 못 봄 ②동기부여용 카드0이 발화 후 노출. 오너 결정 = **"접속할 때마다 처음에, 매일 다른 글귀로"** → 게이트 삭제, **mount 시 노출**(`guide-drip-on-open` 마커). 1회 throttle·덱 끝 정지는 유지.
- **가드레일 강화(`verify-speaking-core.ts`):** 기존엔 철학 7장 + 마무리 위치만 잠금(앱사용 카드 7–11 무방비). 추가: 앱사용 5장 `deepEqual` 잠금(기초→훈련소→스토리→NPC→AI튜터), **정확히 13장**, 모달 `advanceGuideIndex(cardIndex)` 불변식, Home on-open 와이어링(`guide-drip-on-open`+`cardIndex={guideIndex}`). **LOCKED 가드레일을 오너 지시로 의도적 변경 → 새 설계를 보호하도록 업데이트.**

**리뷰 포커스**
- `index.tsx` on-open `useEffect`의 `[]` deps — mount 시 1회. 앱이 자정 넘겨 계속 떠 있으면 다음날 카드가 즉시 안 뜸(다음 mount까지). **알려진 한계**(대부분 접속=콜드스타트라 허용 판단). 포커스 기반으로 바꿀지 검토 여지.
- 가드레일 어서션 ↔ 새 코드 일치(이미 GREEN). LOCKED 파일 변경의 의도성 확인.
- **미해결(에이전트가 짚었으나 이번에 미수정):**
  - `GUIDE_KEY` **비원자 read-modify-write**가 `advanceGuideIndex`/`showGuideCardByMilestone`/`migrateGuideIfStale`에 걸쳐 있음 → 화면 동시 점유 시 lost-update 가능(드묾). 하드닝하려면 단일 라이터 직렬화.
  - throttle은 여전히 **소스 문자열 매칭**만(동작 테스트 아님). AsyncStorage 모킹 필요해 보류.
  - 이모지 💬가 카드 3·11 중복(스펙 무관, cosmetic).

---

## 리뷰어 참고 — 의도된 동작 / 보류 항목
- **boss-spell 힌트는 단일 타깃 언어가 의도**: 답이 고정 `spellChunks`(타깃 문장)라 target-adaptive 아님. 토론 에이전트 확인.
- **story-scene.tsx 데드코드 외곽 boss 힌트 블록(L987/3635/4144)**: 기능 영향 0, 순수 정리라 미수정.
- **레이아웃(b2e6a86) 라이브 시각 검증 미실시** — 위 4) 참고.
- 그 외 모든 변경: tsc 0 · verify:quality 0 errors · verify-speaking-core GREEN · 라이브 200.

## 제안 리뷰 우선순위
1. **`40ad4a1`** (로직 밀도·LOCKED 가드레일 변경) — 최우선.
2. **`c4f62d5`** (타입 위든 + 렌더러 동작 변경) — 회귀 가능성 점검.
3. **`b2e6a86`** (시각 확인 필요).
4. `e48d8f3`/`f4b5f0a` (데이터 위주, 로직 리스크 낮음 — 번역 정확성만).

---

## Codex 리뷰 반영 — `d8ac213` (2026-05-31)
Codex 리뷰가 `40ad4a1`에서 **P2 2건**을 찾았고(P0/P1 블로커 없음), 둘 다 수정·배포했습니다.

- **[P2-1] 손상된 `rudy_guide_index` → NaN 크래시.** `parseInt`이 NaN 미검증 → `NaN>=13`은 false라 NaN 반환 → 모달 가드의 NaN 비교가 전부 false라 통과 → `GUIDE_CARDS[NaN].title` 크래시(이전 `?? GUIDE_CARDS[0]` 폴백 제거로 노출). → `parseGuideIndex()`가 NaN/음수/비정수를 0으로 정규화(read 4곳: getNext/advance/milestone/migrate) + 모달 렌더 가드에 `!Number.isInteger(cardIndex)` 추가(방어심층).
- **[P2-2] 드립이 첫 mount에서만 실행.** `useEffect([])` → 자정 롤오버/백그라운드 복귀/상태 리셋 시 다음 카드 미체크. → `useFocusEffect(maybeShowGuideDrip)` + `AppState 'active'` foreground로 재배선, 1회 throttle 유지.
- `verify-speaking-core`가 두 픽스를 잠금(`parseGuideIndex`+`Number.isInteger` / `useFocusEffect`+`AppState active`). core GREEN · verify:quality exit0.

여전히 미해결로 남긴 저심각 항목(의도/보류): `GUIDE_KEY` 비원자 RMW(드문 동시점유 시 lost-update), throttle 동작테스트(구조 매칭만), 이모지 💬 중복(cosmetic), 레이아웃 `b2e6a86` 라이브 시각확인.

---

## 에이전트팀 2차 처리 — `5d8f8cb` + `f08d9bc` (2026-05-31)
읽기전용 에이전트 3명(A 심층 재리뷰 / B 락 설계 / C 동작테스트)으로 위 잔여 항목을 더 처리. 구현은 단일 작성자.

- **A 신규 발견 [F-1, 최고가치]:** `migrateGuideIfStale`가 `idx >= 8`이라 **mid-drip 사용자(idx 9-12)를 8로 되감아** 본 카드 재생 가능 — 유일하게 no-rewind 가드 누락. → 인덱스 rewrite 제거(13장 덱은 legacy idx=8을 자체 resume), 플래그만 stamp. (`5d8f8cb`)
- **B [RMW 직렬화]:** `rudy_guide_index` 모든 read/write를 `withGuideLock`(in-module promise chain, `_cardPracticeLock` 패턴) 6함수로 직렬화 → cross-function lost-update/torn-read 차단. (`5d8f8cb`)
- **A (b) [cleanup 누수]:** AppState 'active' 경로가 `maybeShowGuideDrip` cleanup 미캡처 → foreground 후 unmount 시 setState 가능. `cancelActive` 캡처/호출로 수정. (`5d8f8cb`)
- **C [동작테스트]:** verify-core는 소스-문자열 기반이라 jest로. `__tests__/rudyGuideDrip.test.ts` 10케이스(throttle·advance-by-shown·no-rewind·corrupt→0·milestone·동시advance 직렬화). **전체 60/60 PASS.** (`f08d9bc`)
- A가 clean 판정: 이중트리거 double-show(throttle로 방지), parseInt 관용성(안전), `sub.remove()`/deps(정상). **블로커 없음**(React19/AS2.2.0/RN0.81).
- 가드레일이 withGuideLock + no-rewind + cancelActive 잠금. core GREEN · verify:quality exit0 · 라이브 200.

남은 저심각: 이모지 💬 중복(cosmetic), 레이아웃 `b2e6a86` 라이브 시각확인.

---

## Codex 2차 리뷰 반영 — (다음 커밋) (2026-05-31)
Codex가 `f08d9bc`에서 P2 2건을 추가로 던짐(둘 다 유효 확인 → 수정).

- **[P2-1] foreground 복귀 시 타 탭 위로 Rudy guide 모달 노출.** `index.tsx`의 AppState listener가 `useEffect`로 등록돼 Home unmount 전까지 상시. 탭 화면은 unmount 안 되므로, 사용자가 Story/NPC/Training에 있을 때 백그라운드→복귀하면 Home 소유 `<Modal>`이 전역 오버레이로 떠 현재 탭을 덮음. → AppState listener를 **`useFocusEffect` 안으로 이동**(focus-scoped): Home이 포커스일 때만 listener 생존, blur 시 제거. `useFocusEffect(maybeShowGuideDrip)`/`cancelActive`/`next === "active"` 앵커 보존 → 가드레일 무변경.
- **[P2-2] Training Camp milestone이 no-op이어도 marker 소비.** `rudy-course.tsx`가 `@first_camp_opened`를 **무조건 먼저 stamp** 후 `showGuideCardByMilestone(8)` 호출. idx<7(철학 미완료) 조기 개방 시 milestone은 no-op인데 marker는 소비돼 **영영 재시도 안 됨** → 캠프 카드 미전달. → marker를 **milestone이 실제 발화(surfaced !== null)했을 때만 stamp**, 철학 완료 후 캠프 재방문 시 재시도.

검증: tsc 0 · verify-speaking-core GREEN · jest 60/60 · verify:quality exit0. (앞 커밋들과 동일 게이트)

### 후속 정리 — milestone already-past 엣지 (다음 커밋)
Codex 3차 리뷰가 새 P1/P2 없음 + 위 2건 정상 종료 확인. 유일한 저심각 잔여(idx≥8에서 첫 캠프 개방 시 marker 미stamp → 재방문 no-op read 반복)를 코덱스 제안대로 정리: `getGuideIndex()` export 추가, rudy-course는 milestone 후 **idx≥8(발화 or 이미 지남)이면 marker stamp** — 철학 미완료(idx<7)만 미stamp로 재시도 보존. jest +1(getGuideIndex). 전체 **61/61 PASS**, tsc 0, core GREEN.
