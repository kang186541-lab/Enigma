# [내부] 파일럿 KPI 측정 설계 — 데이터 파이프라인 & 정의
_⚠️ 내부 문서 (교사 키 포함 — 외부 공유 금지)_

## 1. 파이프라인 (Phase 7에서 구축)
```
학생 앱 (로그인 상태)
  ├─ trackLearningEvent(...)  ← 기존 로컬 이벤트 (화이트리스트 sanitize)
  │     └─ 듀얼라이트 → Supabase linguaai_learning_events (RLS: 본인 insert/select만)
  ├─ session_start            ← UTC 일 1회 핑 (LanguageContext mount)
  └─ 설정 > 수업 코드 입력     → RPC join_cohort(code) → linguaai_cohort_members

교수자 → https://web-dist2.vercel.app/teacher-dashboard
  └─ GET /api/teacher/cohort-summary?code&key (Railway, service-role 집계, 이메일 마스킹)
```

## 2. 지표 정의 (코드와 동일하게 고정)
- **발화 시도(utterance):** `first_speaking_attempt_completed` + `review_sentence_attempt_completed` 이벤트 수. (v2: 레슨/스토리/방탈출 발화 이벤트 추가 예정 — 추가 시 본 문서와 서버 집계를 동시 갱신)
- **활동일:** 해당 UTC 날짜에 이벤트 1개 이상.
- **Dn 리텐션:** 첫 이벤트가 n일 이상 지난 사용자(eligible) 중, 첫 이벤트로부터 n일 이후에 이벤트가 1개 이상 있는 비율. eligible=0이면 null("—").
- **이탈 위험(atRisk):** 마지막 이벤트가 3일 이상 전(또는 이벤트 없음).
- **벤치마크:** 교육앱 D30 ≈ 2% (Business of Apps) — 파일럿 D30이 10%만 나와도 5배 우위 주장 가능.

## 2.1 6주 PoC 확정 KPI (Claude×Codex 3라운드 교차검증, GO)
증명 명제: **"6주간 수업 밖 발화량을 측정 가능한 과제로 만들 수 있는가."** 12주는 로드맵일 뿐 — 계약/제안서엔 6주 PoC만 박는다.

| # | KPI | 정의 | 목표 |
|---|---|---|---|
| ① | 주차 완료율 | 주 필수 미션(데일리 2 + NPC 1) 중 2+ 완료 학생 비율 | 60%+ |
| ② | 발화량 | 학생당 6주 누적 발화 시도(`first_speaking_attempt_completed` + `review_sentence_attempt_completed`) | 30회+ / 주5+ |
| ③ | 주차 지속 | 1주차 가입자 중 W4/W6에도 활동(이벤트 1+)한 비율. D30보다 교수에게 직관적 | — |
| ④ | **band index 변화** | `scoreBand` 수치화 **repair=0 / coach=1 / pass=2**. 첫 3회 평균 vs 마지막 3회 평균 **이동** 비율. ⚠️ "발음 점수 향상"이라 부르지 말 것 — "수행 밴드 이동" | 상승 |
| ⑤ | 교사 재사용 의향 | "다음 학기 과제로 쓸 의향" 5점 + 주관식 | — |

- ⚠️ **NPC/스토리/방탈출은 sink 연결 전까지 KPI 산출에서 제외** — ①②④는 데일리 발화·복습 이벤트만으로 계산. NPC를 필수로 두려면 **NPC 완료를 이벤트 sink에 우선 연결**(개발 ② 1순위)해야 KPI와 모순이 없어진다.
- 주차(week)는 `created_at` 기준 계산 가능 (현재 스키마 그대로). 배정은 `linguaai_assignments` 신규 테이블 사용.

## 3. 데모/운영 자격증명
- 데모 분반: 코드 **GNU2026** / 교사 키 **tk-gnu-demo-7k3x9p** (대시보드 시연용)
- 신규 분반 발급(SQL): `insert into linguaai_cohorts (name, join_code, teacher_key) values ('GNU 교양영어 1분반', 'GNU-E101', 'tk-<랜덤16자>');`

## 4. 검증용 SQL 스니펫 (Supabase SQL Editor)
```sql
-- 일별 활성/발화
select created_at::date d, count(distinct user_id) actives,
       count(*) filter (where event in ('first_speaking_attempt_completed','review_sentence_attempt_completed')) utterances
from linguaai_learning_events group by 1 order by 1 desc;
```

## 5. 운영 체크리스트
- [ ] Supabase **유료 전환 또는 주1회 접속** (무료 자동정지 시 파일럿 데이터 수집 중단됨 — 6/12 실제 발생)
- [ ] Railway env에 `SUPABASE_SERVICE_ROLE_KEY` 설정 확인 (교사 API 503이면 이것)
- [ ] 파일럿 시작 전 리허설: 테스트 계정 가입→코드 입력→발화 3회→대시보드 수치 확인
- [ ] 주간 리포트: 대시보드 캡처 + 위 SQL 결과 → PDF
- [ ] **(Codex GO 조건1)** NPC 완료를 이벤트 sink에 우선 연결 — 안 하면 "NPC 필수"인데 KPI 집계 밖이라 모순
- [ ] **(Codex GO 조건2)** 진단 프롬프트 W1=W6 고정 + 리포트엔 "수행 밴드 이동"으로 표기, **"발음 점수 향상" 단어 금지**(암기효과·과장 회피)
- [ ] 교사 재사용 의향 설문(KPI⑤) 수집 절차 — 종료 인터뷰에 포함
