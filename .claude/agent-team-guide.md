# Enigma Agent Team Setup Guide

## 1. Replit에서 코드 다운로드

Replit 프로젝트 → 왼쪽 파일 탐색기 상단 ⋮ → "Download as zip" → 컴퓨터에 저장

## 2. 프로젝트 폴더 구조 만들기

zip을 풀고, 아래 폴더/파일을 추가하세요:

```
enigma/
├── .claude/
│   ├── settings.json                ← 직접 만들기
│   └── agents/
│       ├── curriculum-evaluator.md  ← 다운받은 파일 넣기
│       └── story-evaluator.md       ← 다운받은 파일 넣기
├── data/
│   ├── evaluation/                  ← 빈 폴더 만들기 (에이전트 리포트 저장용)
│   ├── dailyCourse/                 ← 커리큘럼 에이전트 결과물
│   └── storyMode/                   ← 스토리 에이전트 결과물
├── (나머지 앱 코드)
```

## 3. settings.json 만들기

`.claude/settings.json` 파일을 메모장으로 만들어서 저장:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## 4. 환경변수 (.env) 파일 만들기

프로젝트 루트에 `.env` 파일을 만들고, Replit Secrets에 있던 값을 복사:

```
OPENAI_API_KEY=sk-여기에키입력
AZURE_SPEECH_KEY=여기에키입력
AZURE_SPEECH_REGION=koreacentral
```

Replit에서 키 확인: 왼쪽 메뉴 🔒 Secrets 탭

## 5. 컴퓨터에 필요한 것 설치

### Git for Windows (필수)
→ https://git-scm.com 다운로드, 기본 옵션으로 설치

### Claude Code 설치
PowerShell 열고:
```
irm https://claude.ai/install.ps1 | iex
```

### Node.js (앱 실행용)
→ https://nodejs.org 에서 LTS 버전 다운로드

## 6. 실행

### PowerShell에서:
```bash
# 프로젝트 폴더로 이동
cd C:\Users\너이름\Documents\enigma

# 의존성 설치
npm install

# Claude Code 실행
claude
```

처음 실행하면 로그인 화면 → Claude Pro/Max 계정으로 로그인

## 7. 에이전트 팀 실행

Claude Code가 열리면 아래를 입력:

```
Create an agent team for the Enigma Language Adventure project.

Team members:

1. "Curriculum Evaluator" — use the curriculum-evaluator agent.
   Task: Read the entire codebase and current daily course data.
   Phase 1: Evaluate if a complete beginner can actually learn to speak
   from this app. Compare with Duolingo and Speak. Write a brutally honest
   evaluation report to data/evaluation/curriculum_report.md
   Phase 2: Based on your evaluation, either improve or completely
   restructure the curriculum. Wait for my approval before generating content.

2. "Story Evaluator" — use the story-evaluator agent.
   Task: Read all story mode data (storyData.json, quizData.json).
   Phase 1: Rate the story out of 10. Evaluate plot, characters, pacing,
   and whether the story actually helps users learn. Write an honest
   evaluation report to data/evaluation/story_report.md
   Phase 2: Based on your verdict (keep/partial rewrite/complete rewrite),
   propose changes. Wait for my approval before writing new content.

Both agents work in parallel. Each writes their evaluation report first,
then waits for my feedback before Phase 2.
```

## 8. 리포트 확인 후 Phase 2 진행

에이전트들이 리포트를 만들면 읽어보고:

### 커리큘럼 리포트가 "KEEP AND IMPROVE"면:
```
Curriculum agent: Good report. Proceed with Phase 2 — improve the weaknesses
you found and generate Unit 2 (Day 7-12) first. Save to data/dailyCourse/unit2.json
```

### 커리큘럼 리포트가 "MAJOR RESTRUCTURE NEEDED"면:
```
Curriculum agent: I agree with the restructure. Go ahead with your proposed
new structure. Generate the first unit as a sample. Save to data/dailyCourse/
```

### 스토리 리포트가 "KEEP AND POLISH"면:
```
Story agent: Good analysis. Write Chapter 4 (Cairo Legacy) with your
improvements. Save to data/storyMode/chapter4.json
```

### 스토리 리포트가 "COMPLETE REWRITE"면:
```
Story agent: I agree. Propose a new story concept first. Don't write
the full story yet — just give me the outline and I'll approve.
```

## 9. 유용한 명령어들

### 하나의 에이전트만 실행:
```
Use the curriculum-evaluator agent to generate Unit 3 (Day 13-18).
Save to data/dailyCourse/unit3.json
```

### 여러 Unit 동시 생성 (서브에이전트):
```
Generate daily course content using parallel sub-agents:
- Sub-agent 1: curriculum-evaluator → Unit 2 (Day 7-12)
- Sub-agent 2: curriculum-evaluator → Unit 3 (Day 13-18)
- Sub-agent 3: story-evaluator → Chapter 4
Run all 3 in parallel.
```

### 코드 수정도 같이 하기:
```
Read the daily course screen code. The targetLang switching is broken —
Spanish content shows English. Find and fix the bug.
```

## 10. 주의사항

- **Claude Pro 또는 Max 계정 필요** — 무료 계정으로는 Claude Code 사용 불가
- **에이전트 팀은 실험 기능** — 가끔 불안정할 수 있음. 안 되면 터미널 여러 개로 대체
- **같은 파일 동시 수정 주의** — 두 에이전트가 같은 파일 건드리면 충돌남
- **토큰 비용** — 에이전트 여러 개 = 비용 여러 배. Max 구독이 경제적

## 11. 추천 작업 순서

| 우선순위 | 에이전트 | 작업 |
|---------|---------|------|
| 1 | 둘 다 | Phase 1 평가 리포트 작성 (동시에) |
| 2 | 둘 다 | 리포트 확인 후 방향 결정 |
| 3 | Curriculum | 첫 번째 Unit 생성 (샘플) |
| 4 | Story | 첫 번째 챕터 수정/재작성 (샘플) |
| 5 | 둘 다 | 샘플 확인 후 나머지 콘텐츠 대량 생성 |
