# 포리(Forry) - 온톨로지 아키텍트 설계 가이드

**전문가**: 포리 (Palantir 스타일 온톨로지 아키텍트)
**분석일**: 2025-12-03
**관점**: Ontology Design, Data Modeling, Knowledge Graph Architecture

---

## 요약 (Executive Summary)

채용 온톨로지는 **PM이 주도하되, 개발팀과 협업하는 프로젝트**입니다. 완벽한 스키마보다 **진화 가능한 구조**가 중요합니다.

**핵심 제안**:
- MVP는 **7개 Objects + 5개 Links**로 시작
- 시간성(Temporality)을 3-Layer로 표현: Current State, History, Aggregates
- PM 전용 도구 구축: 온톨로지 맵, 쿼리 빌더, 품질 대시보드

---

## 1. 온톨로지 설계 접근법

### 4-Tier Object 구조

채용 도메인을 4개 계층으로 나눕니다:

#### Tier 1: Core Objects (핵심 엔티티)
```
Candidate (후보자)
├─ id, name, email, phone
├─ current_company, current_title
├─ skills[], education_history[]
└─ created_at, updated_at

Job_Posting (채용 공고)
├─ id, title, department
├─ required_skills[], nice_to_have_skills[]
├─ salary_range, employment_type
└─ status, posted_at, closed_at

Application (지원)
├─ id, candidate_id, job_posting_id
├─ source (LinkedIn, Referral, Direct)
├─ applied_at, current_stage
└─ status (active, rejected, hired, withdrawn)

Interview (면접)
├─ id, application_id, interviewer_id
├─ interview_type (phone, technical, cultural)
├─ scheduled_at, completed_at
└─ location (on-site, remote)

Evaluation (평가)
├─ id, interview_id, interviewer_id
├─ overall_score, dimension_scores{}
├─ strengths[], concerns[]
└─ recommendation (strong_yes, yes, no, strong_no)
```

#### Tier 2: Process Objects (프로세스)
```
Stage_Transition (단계 전환)
├─ id, application_id
├─ from_stage, to_stage
├─ transitioned_at, transitioned_by
└─ duration (자동 계산)

Communication (커뮤니케이션)
├─ id, application_id
├─ from (recruiter), to (candidate)
├─ channel (email, phone, SMS)
├─ content_summary
└─ sent_at, read_at, responded_at

Task (태스크)
├─ id, application_id, assignee_id
├─ task_type (schedule_interview, send_offer, reference_check)
├─ due_date, completed_at
└─ status
```

#### Tier 3: People Objects (사람)
```
Hiring_Manager (채용 매니저)
├─ id, name, department
├─ active_job_postings[]
└─ hiring_velocity (평균 리드타임)

Interviewer (면접관)
├─ id, name, specialization
├─ interview_count, avg_duration
└─ calibration_score (평가 일관성)

Recruiter (리크루터)
├─ id, name
├─ assigned_job_postings[]
└─ performance_metrics{}
```

#### Tier 4: Reference Objects (참조)
```
Evaluation_Rubric (평가 기준)
├─ id, job_posting_id
├─ dimensions[] (technical, culture_fit, communication)
└─ score_guide{}

Skill (스킬)
├─ id, name, category
└─ synonyms[]

Assessment_Template (평가 템플릿)
├─ id, interview_type
└─ questions[], time_limit
```

### Links (관계) 3가지 유형

#### 정적 관계 (Structural)
```
APPLIES_TO: Candidate → Application → Job_Posting
FOR_POSITION: Interview → Job_Posting
EVALUATED_BY: Evaluation → Interviewer
MANAGES: Hiring_Manager → Job_Posting
```

#### 동적 관계 (Temporal)
```
PROGRESSES_TO: Stage_Transition (방향성, 시간성)
EVALUATES: Interviewer → Candidate (through Interview)
COMMUNICATES_WITH: Recruiter ↔ Candidate
COMPETES_WITH: Application ↔ Application (동일 Job_Posting)
```

#### 파생 관계 (Inferred)
```
INTERVIEWED_BY: Candidate → Interviewer (Interview 집계)
SIMILAR_TO: Candidate ↔ Candidate (스킬, 경력 유사도)
SUCCESSFUL_IN: Candidate → Job_Posting (채용 성공 여부)
```

### 시간성 모델링 (3-Layer)

채용 프로세스는 시간에 따라 변화합니다. 이를 3가지 레이어로 표현:

**Layer 1: Current State (현재 상태)**
```
Application.current_stage = "final_interview"
Application.status = "active"
→ 빠른 조회용 (대부분의 쿼리)
```

**Layer 2: Change History (변경 이력)**
```
Stage_Transition 테이블
- application_123: applied → screening (2024-11-01)
- application_123: screening → phone_interview (2024-11-05)
- application_123: phone_interview → technical_interview (2024-11-08)
- application_123: technical_interview → final_interview (2024-11-15)
→ 이벤트 소싱, 감사 추적
```

**Layer 3: Aggregated Metrics (집계 메트릭)**
```
Job_Posting.avg_time_to_hire = 45 days
Job_Posting.stage_conversion_rates = {
  screening_to_phone: 0.4,
  phone_to_technical: 0.6,
  technical_to_final: 0.7,
  final_to_offer: 0.8
}
→ AI 학습용, 벤치마크 비교
```

---

## 2. 고객 가치 중심 우선순위

### 가장 임팩트 큰 Use Cases (Top 3)

#### 🥇 Use Case 1: 리드타임 예측 및 병목 알림

**비즈니스 가치**: 후보자 경험 개선, 기회비용 감소

**온톨로지 쿼리**:
```
FOR application IN Application
  FILTER application.status == "active"
  LET transitions = Stage_Transition[application.id]
  LET current_duration = NOW() - last(transitions).transitioned_at
  LET avg_duration = Historical_Benchmark[application.job_posting.role].avg_duration
  FILTER current_duration > avg_duration * 1.5
  RETURN {
    application,
    bottleneck: last(transitions).to_stage,
    delay: current_duration - avg_duration,
    responsible: Hiring_Manager[application.job_posting.hiring_manager_id]
  }
```

**필요한 Objects**: Application, Stage_Transition, Job_Posting, Historical_Benchmark, Hiring_Manager

#### 🥈 Use Case 2: 유사 후보자 추천

**비즈니스 가치**: 면접관 준비 지원, 평가 캘리브레이션

**온톨로지 쿼리**:
```
FOR current_candidate IN Candidate
  LET similar_candidates = (
    FOR other IN Candidate
      FILTER other.id != current_candidate.id
      LET skill_overlap = INTERSECTION(current.skills, other.skills).length
      LET company_match = (current.current_company IN other.employment_history)
      LET score = skill_overlap * 2 + (company_match ? 5 : 0)
      FILTER score > 8
      SORT score DESC
      LIMIT 5
      RETURN {
        candidate: other,
        similarity_score: score,
        past_applications: Application[other.id],
        past_evaluations: Evaluation[Application[other.id].interview_ids]
      }
  )
  RETURN { current_candidate, similar_candidates }
```

**필요한 Objects**: Candidate, Application, Interview, Evaluation

#### 🥉 Use Case 3: 커뮤니케이션 품질 스코어링

**비즈니스 가치**: 우수 후보자 이탈 방지

**온톨로지 쿼리**:
```
FOR application IN Application
  FILTER application.status == "active"
  LET communications = Communication[application.id]
  LET response_times = communications[*].responded_at - communications[*].sent_at
  LET avg_response_time = AVG(response_times)
  LET last_contact = MAX(communications[*].sent_at)
  FILTER (NOW() - last_contact) > 5 days
  RETURN {
    application,
    days_since_last_contact: (NOW() - last_contact) / (24*60*60),
    candidate_responsiveness: avg_response_time,
    action: "send_followup_email"
  }
```

**필요한 Objects**: Application, Communication

### MVP 범위 (Phase 1, 3개월)

| 요소 | 포함 | 이유 |
|------|------|------|
| Objects | 7개 | Candidate, Job_Posting, Application, Interview, Evaluation, Stage_Transition, Historical_Benchmark |
| Links | 5개 | APPLIES_TO, FOR_POSITION, PROGRESSES_TO, EVALUATED_BY, MANAGES |
| Use Cases | 1개 | 리드타임 예측 (가장 단순, 명확한 가치) |
| Data Sources | 1-2개 | 기존 ATS + 수동 벤치마크 |
| LLM 통합 | 제한적 | 자연어 인사이트 생성만 (추론은 규칙 기반) |

**MVP 성공 기준**:
- 온톨로지 스키마 안정화 (변경 빈도 < 1회/주)
- Use Case 1 정확도 70% 이상
- 쿼리 응답 시간 < 3초 (p95)

### 확장 전략 (Phased Approach)

**Phase 2 (MVP+3개월): 사람 및 평가 심화**
- Objects 추가: Hiring_Manager, Interviewer, Evaluation_Rubric
- Links 추가: CALIBRATES (면접관 간 평가 일관성)
- Use Case 추가: 유사 후보자 추천

**Phase 3 (MVP+6개월): 지식 그래프 + AI 통합**
- 파생 관계 추가: SIMILAR_TO, COMPETES_WITH
- LLM 본격 통합: 평가 코멘트 NLP, 의도 추론
- Use Case 추가: 커뮤니케이션 품질 스코어링

**Phase 4 (MVP+12개월): 예측 및 최적화**
- 외부 데이터 통합: LinkedIn, GitHub
- 머신러닝 모델: 오퍼레터 예측, 최적 연봉 제안
- Use Case 추가: 프로액티브 후보자 추천

---

## 3. 유지보수 용이성

### PM이 온톨로지 관리하는 3가지 도구

#### 도구 1: 온톨로지 맵 (Visual Schema Editor)

**기능**:
- Drag & Drop으로 Object 추가/삭제
- Link 클릭 → 속성 편집
- 실시간 영향 분석 ("이 Object 삭제 시 영향받는 쿼리 3개")

**PM 사용 시나리오**:
```
1. 새 Object 추가 (예: "Offer" Object)
2. 속성 정의: offer_amount, equity, start_date
3. Link 추가: Application → Offer (HAS_OFFER)
4. 샘플 데이터 입력 (10개 레코드)
5. 쿼리 테스트: "오퍼 수락률 조회"
6. 개발팀에 스키마 변경 요청 (자동 생성된 DDL 첨부)
```

#### 도구 2: 쿼리 빌더 (No-Code Query Builder)

**기능**:
- SQL 없이 데이터 조회
- "이 조건을 만족하는 Application 찾기" → GUI로 필터 설정
- 쿼리 저장 → 알림 규칙으로 전환

**PM 사용 시나리오**:
```
쿼리: "현재 단계가 final_interview이고, 7일 이상 지연된 Application"
1. Object 선택: Application
2. 필터 추가:
   - current_stage = "final_interview"
   - last_stage_transition > 7 days ago
3. 출력 필드: candidate_name, job_title, delay_days
4. 쿼리 저장 → "주간 병목 리포트"로 등록
5. Slack 알림 설정 (매주 월요일 9am)
```

#### 도구 3: 품질 대시보드 (Data Quality Dashboard)

**모니터링 메트릭**:
```
필드 완성도:
- Candidate.skills: 85% (목표: 90%)
- Evaluation.dimension_scores: 60% (목표: 80%)
- Stage_Transition.duration: 95% ✅

데이터 일관성:
- Application without Candidate: 0 ✅
- Interview without Evaluation: 12 ⚠️ (조사 필요)
- Job_Posting with 0 Applications: 5 (정상)

노이즈 레벨:
- Duplicate Candidates: 3 (병합 필요)
- Evaluation.overall_score 범위 이탈: 0 ✅
```

**주간 자동 리포트**:
- PM에게 이메일: "이번 주 데이터 품질 요약 + 액션 아이템"
- 개선 추세 그래프

### 스키마 변경 3원칙

#### 원칙 1: 속성 추가는 자유, 삭제는 신중

**OK (하위 호환)**:
```
Candidate에 "linkedin_url" 추가
→ 기존 쿼리 영향 없음
→ PM이 직접 추가 가능
```

**조심 (하위 호환 깨짐)**:
```
Candidate에서 "email" 삭제
→ 10개 쿼리가 깨질 수 있음
→ 개발팀과 협의 필수
```

#### 원칙 2: Link Type은 방향성 명확히

**명확한 Link**:
```
APPLIES_TO: Candidate → Application (단방향)
MANAGES: Hiring_Manager → Job_Posting (단방향)
```

**애매한 Link (피하기)**:
```
RELATED_TO: Candidate ↔ Candidate (무엇이 related?)
→ 대신: REFERRED_BY, INTERVIEWED_WITH 등 명확한 의미
```

#### 원칙 3: 버전 관리는 Object 단위로

**스키마 버전**:
```
Candidate v1.0 → v1.1 (linkedin_url 추가)
Candidate v1.1 → v2.0 (employment_history 구조 변경)
```

**마이그레이션 전략**:
```
1. v1.1과 v2.0 동시 지원 (3개월)
2. 모든 쿼리를 v2.0으로 전환
3. v1.1 deprecate
```

---

## 4. 실행 플랜 (8주 Sprint)

### Week 1-2: Discovery (PM 주도)

**Activity 1: 고객 인터뷰 (5-7명)**
- "어떤 데이터를 가장 자주 조회하나요?"
- "어떤 인사이트가 있으면 좋겠나요?"
- "현재 데이터의 문제점은?"

**Activity 2: 현재 데이터 인벤토리**
```
테이블 리스트:
- candidates (12 컬럼, 5000 rows)
- applications (18 컬럼, 15000 rows)
- interviews (10 컬럼, 8000 rows)
- evaluations (15 컬럼, 7500 rows)

필드 완성도:
- candidates.email: 98%
- evaluations.comments: 45% ⚠️
- interviews.scheduled_at: 95%
```

**Activity 3: 워크플로우 맵핑**
```
Application Lifecycle:
applied → screening → phone_interview → technical_interview
→ final_interview → offer → hired
```

**산출물**:
- 데이터 인벤토리 리포트
- 워크플로우 다이어그램
- Use Case 우선순위 (Top 3)

### Week 3-4: Schema Design (포리 주도, PM 협업)

**Activity 1: Object 정의 워크샵 (2일)**
- Day 1: Core Objects (Candidate, Job_Posting, Application)
- Day 2: Process Objects (Stage_Transition, Interview)

**Activity 2: Link 정의**
```
APPLIES_TO: Candidate → Application
FOR_POSITION: Application → Job_Posting
PROGRESSES_TO: Stage_Transition (self-referential)
```

**Activity 3: 시간성 모델링**
```
Q: "과거 오퍼레터율을 어떻게 조회?"
A: Historical_Benchmark Object 추가
   - job_role, time_period, offer_accept_rate
```

**산출물**:
- 온톨로지 스키마 v1.0 (ERD)
- 샘플 쿼리 3개 (Use Case별)
- PM용 온톨로지 맵 (Figma/Miro)

### Week 5-6: Prototype (개발팀 협업)

**Sprint 1: 물리 스키마 구현**
```
PostgreSQL + GraphQL:
- 7개 테이블 생성
- 외래 키, 인덱스 설정
- 샘플 데이터 100개 레코드 입력
```

**Sprint 2: 쿼리 테스트**
```
Use Case 1 쿼리:
- 실행 시간 측정 (목표: < 3초)
- 정확도 테스트 (수동 레이블 vs 쿼리 결과)
- 엣지 케이스 (데이터 누락 시 어떻게?)
```

**산출물**:
- 작동하는 프로토타입 (Read-only)
- 성능 리포트
- 정확도 기준선

### Week 7-8: Refinement

**Activity 1: 스키마 최적화**
```
발견: Stage_Transition 쿼리가 느림 (5초)
원인: duration 필드를 매번 계산
해결: duration을 pre-computed 컬럼으로 변경
결과: 0.5초로 개선
```

**Activity 2: PM 도구 프로토타입**
- 온톨로지 맵 (Figma Interactive Prototype)
- 쿼리 빌더 (Google Sheets로 mockup)

**Activity 3: 문서화**
```
1. PM을 위한 온톨로지 가이드
   - "새 Object 추가하는 법"
   - "Link vs 속성 판단 기준"
   - "데이터 품질 체크리스트"

2. 개발자를 위한 스키마 레퍼런스
   - API 문서
   - 쿼리 최적화 가이드
```

**산출물**:
- 온톨로지 스키마 v1.0 Final
- PM 가이드북
- 개발자 레퍼런스

---

## 5. 역할 분담 (PM vs 개발팀)

### PM이 하는 것 ✅

1. **Use Case 정의**
   - "어떤 인사이트가 필요한가?"
   - "이 쿼리의 비즈니스 의미는?"

2. **Object/Link 명명**
   - "Candidate vs Applicant?" → 고객 언어로 결정
   - "PROGRESSES_TO vs TRANSITIONS_TO?" → 의미 명확성

3. **샘플 데이터 작성**
   - "실제 시나리오 10개" (정확도 테스트용)

4. **데이터 품질 모니터링**
   - 주간 대시보드 리뷰
   - "Evaluation.comments 완성도가 45%인데, 왜?"

5. **문서화**
   - 비개발자가 이해할 수 있는 가이드

### 개발팀이 하는 것 ✅

1. **물리 스키마 설계**
   - PostgreSQL vs MongoDB?
   - 인덱싱 전략
   - 샤딩, 복제

2. **API 구현**
   - GraphQL/REST endpoints
   - 인증, 권한 관리

3. **성능 최적화**
   - 쿼리 튜닝
   - 캐싱 전략

4. **마이그레이션**
   - 스키마 변경 스크립트
   - 무중단 배포

### 협업이 필요한 것 🤝

1. **Link 정의**
   - PM: "비즈니스 의미" (MANAGES = 누가 책임자?)
   - 개발: "카디널리티" (1:N? N:M?)

2. **쿼리 최적화**
   - PM: "이 쿼리가 느린데 왜?"
   - 개발: "인덱스 추가하면 10배 빨라짐"

3. **샘플 데이터 검증**
   - PM: "이 데이터가 현실적인가?"
   - 개발: "이 데이터로 쿼리 테스트 가능한가?"

---

## 6. 리스크와 함정

### 흔한 실수 4가지

#### 실수 1: 과도한 추상화
**증상**: "모든 엔티티를 Entity Object 하나로..."
**문제**: 쿼리가 복잡해지고, 타입 안정성 상실
**해결**: 구체적인 Object 유지 (Candidate, Job_Posting 별도)

#### 실수 2: 정규화 과도 vs 부족
**과도한 정규화**:
```
Candidate → Education (별도 테이블) → School (별도 테이블)
→ 조인 3번 필요, 느림
```

**부족한 정규화**:
```
Candidate.education_history = "서울대 2015-2019, 카이스트 석사 2019-2021"
→ 파싱 필요, 쿼리 불가
```

**적절한 균형**:
```
Candidate.education_history = [
  {school: "서울대", degree: "학사", year: "2015-2019"},
  {school: "카이스트", degree: "석사", year: "2019-2021"}
]
→ JSON 컬럼, 쿼리 가능, 조인 불필요
```

#### 실수 3: 시간성 무시
**증상**: Application.status만 저장 (current)
**문제**: "언제 이 단계로 왔나?" 알 수 없음
**해결**: Stage_Transition 별도 테이블 (이벤트 소싱)

#### 실수 4: Link 속성을 Object에 저장
**잘못된 설계**:
```
Candidate.interviewers = ["김OO", "이XX"]
→ Link 정보가 Candidate Object에
→ 면접 날짜, 평가 점수는 어디에?
```

**올바른 설계**:
```
Interview Object 생성
- candidate_id, interviewer_id
- scheduled_at, evaluation_score
→ Link가 독립적인 엔티티
```

### PM 주의사항 5가지

1. **기술 용어에 속지 말고 비즈니스 언어로 검증**
   - "이 온톨로지로 '누가 채용 병목인지' 찾을 수 있나?"
   - 엔지니어에게 물어보고, 실제 쿼리 보기

2. **"완벽한 스키마" 추구 대신 진화 수용**
   - v1.0은 틀릴 수밖에 없음
   - 고객 피드백으로만 검증 가능

3. **데이터 품질 = 온톨로지 설계만큼 중요**
   - 완벽한 스키마 + 쓰레기 데이터 = 쓰레기 인사이트
   - 데이터 입력 자동화에 투자

4. **Day 1부터 PM 전용 도구 구축**
   - "SQL 쿼리 짜줘" 개발팀에 매번 요청 → 병목
   - 쿼리 빌더, 대시보드 먼저 만들기

5. **Prototype으로 조기 고객 검증**
   - Week 6에 고객에게 보여주기
   - "이 인사이트 유용한가요?" 피드백

---

## 다음 단계

즉시 실행 가능한 액션:
1. **Week 1**: 고객 인터뷰 5명 일정 잡기
2. **Week 2**: 현재 ATS 데이터 샘플 추출 (100개 레코드)
3. **Week 3**: 온톨로지 워크샵 일정 (2일, 참여자 4명)

더 도움이 필요한 부분이 있나요?
