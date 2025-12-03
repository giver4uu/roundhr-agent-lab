# 데이터 품질 감사 템플릿

**목적**: 현재 ATS 데이터로 온톨로지 구축이 6개월 내 가능한지 검증 (가정 3)
**실행 시점**: Week 3 (2025-12-16 ~ 12-20)
**담당**: PM (Terry) + Data Engineer
**Exit Criteria**: 70% 이상 품질 → GO / 50-70% → PIVOT / 50% 미만 → STOP

---

## 1. 샘플 데이터 추출 요청

### 엔지니어팀에게 보낼 요청서

```markdown
Subject: [긴급] 온톨로지 프로젝트 - 샘플 데이터 추출 요청

안녕하세요, Terry입니다.

온톨로지 기반 AI 추천 시스템 Phase 0 진행 중, 데이터 품질 감사를 위해 샘플 데이터 추출을 요청드립니다.

### 요청 내용

**추출 기한**: 2025-12-16 (월) 오전까지
**데이터 범위**: 아래 5개 고객의 채용 프로세스 데이터

#### 고객 선정 (규모 다양)
1. 고객A (직원 수: ~50명) - 스타트업
2. 고객B (직원 수: ~150명) - 중소기업
3. 고객C (직원 수: ~300명) - 중견기업
4. 고객D (직원 수: ~500명) - 중견기업
5. 고객E (직원 수: ~1000명) - 대기업

#### 각 고객별 추출 데이터
- **채용 프로세스**: 최근 완료된 프로세스 50-100개
  - 조건: `status IN ('hired', 'rejected', 'withdrawn')`
  - 기간: 최근 12개월
  - 랜덤 샘플링

#### 추출 테이블 및 필드

**1. candidates (후보자)**
```sql
SELECT
  id,
  name, -- 익명화: "Candidate_001"
  email, -- 익명화: "candidate001@example.com"
  phone, -- NULL 처리
  current_company,
  current_title,
  skills, -- JSON array or comma-separated
  education_history, -- JSON array
  created_at,
  updated_at
FROM candidates
WHERE id IN (SELECT candidate_id FROM applications WHERE ...)
```

**2. job_postings (채용 공고)**
```sql
SELECT
  id,
  title,
  department,
  required_skills,
  nice_to_have_skills,
  salary_range_min,
  salary_range_max,
  employment_type,
  status,
  posted_at,
  closed_at
FROM job_postings
WHERE id IN (SELECT job_posting_id FROM applications WHERE ...)
```

**3. applications (지원)**
```sql
SELECT
  id,
  candidate_id,
  job_posting_id,
  source, -- (LinkedIn, Referral, Direct 등)
  applied_at,
  current_stage,
  status,
  final_result, -- (hired, rejected, withdrawn)
  rejection_reason, -- if available
  offer_accepted_at -- if hired
FROM applications
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  AND status IN ('hired', 'rejected', 'withdrawn')
ORDER BY RAND()
LIMIT 100 PER 고객
```

**4. interviews (면접)**
```sql
SELECT
  id,
  application_id,
  interviewer_id, -- 익명화: "Interviewer_001"
  interview_type, -- (phone, technical, cultural, final 등)
  scheduled_at,
  completed_at,
  duration_minutes,
  location_type -- (on-site, remote)
FROM interviews
WHERE application_id IN (...)
```

**5. evaluations (평가)**
```sql
SELECT
  id,
  interview_id,
  interviewer_id,
  overall_score, -- (1-5 스케일 또는 텍스트)
  dimension_scores, -- JSON: {technical: 4, culture_fit: 3, communication: 5}
  strengths, -- 텍스트
  concerns, -- 텍스트
  recommendation, -- (strong_yes, yes, no, strong_no 등)
  created_at
FROM evaluations
WHERE interview_id IN (...)
```

**6. stage_transitions (단계 전환) - 있다면**
```sql
SELECT
  id,
  application_id,
  from_stage,
  to_stage,
  transitioned_at,
  transitioned_by, -- 익명화
  notes
FROM stage_transitions
WHERE application_id IN (...)
ORDER BY transitioned_at
```

**7. communications (커뮤니케이션) - 있다면**
```sql
SELECT
  id,
  application_id,
  from_type, -- (recruiter, candidate, system)
  to_type,
  channel, -- (email, phone, SMS, in-app)
  subject, -- 이메일 제목
  content_summary, -- 본문 첫 100자 (민감정보 제거)
  sent_at,
  read_at,
  responded_at
FROM communications
WHERE application_id IN (...)
```

#### 데이터 포맷
- **파일 형식**: CSV 또는 JSON
- **인코딩**: UTF-8
- **압축**: ZIP
- **파일명**: `customer_{A-E}_{table_name}.csv`

#### 익명화 요구사항
- 후보자 이름: "Candidate_001", "Candidate_002", ...
- 이메일: "candidate001@example.com"
- 전화번호: NULL 처리
- 면접관 이름: "Interviewer_001", "Interviewer_002", ...
- 평가 코멘트에서 개인 식별 정보 제거

#### 전달 방법
- AWS S3 버킷: `s3://company-data-audit/ontology-project/`
- 또는 안전한 파일 공유 링크

### 질문/문의
질문 있으시면 Slack #ats-ontology-ai 채널로 부탁드립니다.

감사합니다!
Terry
```

---

## 2. 데이터 품질 스코어카드

### 2.1 필드 완성도 (Completeness) 측정

**목표**: MVP 온톨로지에 필수인 필드가 얼마나 채워져 있는가?

#### 측정 방법
```
완성도 = (NULL이 아닌 레코드 수) / (전체 레코드 수) × 100%
```

#### 고객별 스코어카드 템플릿

**고객 A (50명 규모) - 샘플 크기: 100개 프로세스**

| 테이블 | 필드 | 중요도 | 목표 | 실제 | 통과 |
|--------|------|--------|------|------|------|
| **candidates** |||||
|| email | 필수 | 95% | __% | ☐ |
|| current_company | 필수 | 90% | __% | ☐ |
|| current_title | 필수 | 90% | __% | ☐ |
|| skills | 높음 | 80% | __% | ☐ |
|| education_history | 중간 | 70% | __% | ☐ |
| **applications** |||||
|| source | 높음 | 80% | __% | ☐ |
|| current_stage | 필수 | 95% | __% | ☐ |
|| status | 필수 | 100% | __% | ☐ |
|| final_result | 필수 | 100% | __% | ☐ |
|| rejection_reason | 중간 | 60% | __% | ☐ |
| **interviews** |||||
|| interview_type | 필수 | 90% | __% | ☐ |
|| scheduled_at | 필수 | 95% | __% | ☐ |
|| completed_at | 필수 | 90% | __% | ☐ |
|| duration_minutes | 낮음 | 50% | __% | ☐ |
| **evaluations** |||||
|| overall_score | 필수 | 85% | __% | ☐ |
|| dimension_scores | 높음 | 70% | __% | ☐ |
|| strengths | 중간 | 50% | __% | ☐ |
|| concerns | 중간 | 50% | __% | ☐ |
|| recommendation | 높음 | 80% | __% | ☐ |
| **stage_transitions** |||||
|| from_stage | 필수 | 90% | __% | ☐ |
|| to_stage | 필수 | 90% | __% | ☐ |
|| transitioned_at | 필수 | 95% | __% | ☐ |

**종합 점수**: (통과한 필수 필드 수) / (전체 필수 필드 수) × 100% = ___%

---

### 2.2 데이터 일관성 (Consistency) 측정

**목표**: 데이터 간 참조 무결성과 논리적 일관성이 유지되는가?

#### 체크리스트

| 검증 항목 | 쿼리/확인 방법 | 목표 | 실제 | 통과 |
|----------|---------------|------|------|------|
| **참조 무결성** |||||
| Application without Candidate | `SELECT COUNT(*) FROM applications WHERE candidate_id NOT IN (SELECT id FROM candidates)` | 0 | __ | ☐ |
| Interview without Application | `SELECT COUNT(*) FROM interviews WHERE application_id NOT IN (SELECT id FROM applications)` | 0 | __ | ☐ |
| Evaluation without Interview | `SELECT COUNT(*) FROM evaluations WHERE interview_id NOT IN (SELECT id FROM interviews)` | 0 | __ | ☐ |
| **논리적 일관성** |||||
| Application.applied_at > Job_Posting.closed_at | `SELECT COUNT(*) FROM applications a JOIN job_postings j ON a.job_posting_id = j.id WHERE a.applied_at > j.closed_at` | 0 | __ | ☐ |
| Interview.completed_at < Interview.scheduled_at | `SELECT COUNT(*) FROM interviews WHERE completed_at < scheduled_at` | 0 | __ | ☐ |
| Stage Transition 순서 위반 | `SELECT COUNT(*) FROM stage_transitions WHERE transitioned_at < (이전 transition)` | < 5% | __% | ☐ |
| **상태 일관성** |||||
| status='hired' but no offer_accepted_at | `SELECT COUNT(*) FROM applications WHERE status='hired' AND offer_accepted_at IS NULL` | < 10% | __% | ☐ |
| status='rejected' but no rejection_reason | `SELECT COUNT(*) FROM applications WHERE status='rejected' AND rejection_reason IS NULL` | < 40% | __% | ☐ |

---

### 2.3 노이즈 레벨 (Noise) 측정

**목표**: 중복, 오타, 형식 불일치가 얼마나 있는가?

#### 체크리스트

| 노이즈 유형 | 확인 방법 | 허용 범위 | 실제 | 통과 |
|------------|----------|----------|------|------|
| **중복** |||||
| Duplicate Candidates (동일 email) | `SELECT email, COUNT(*) FROM candidates GROUP BY email HAVING COUNT(*) > 1` | < 2% | __% | ☐ |
| Duplicate Applications (동일 candidate + job_posting) | 쿼리 | < 1% | __% | ☐ |
| **형식 불일치** |||||
| interview_type 값 다양성 | `SELECT DISTINCT interview_type FROM interviews` → 표준화 필요 여부 | < 10종류 | __ 종류 | ☐ |
| source 값 다양성 | `SELECT DISTINCT source FROM applications` | < 15종류 | __ 종류 | ☐ |
| recommendation 값 다양성 | `SELECT DISTINCT recommendation FROM evaluations` | < 5종류 | __ 종류 | ☐ |
| **범위 이탈** |||||
| overall_score 범위 (1-5 가정) | `SELECT COUNT(*) FROM evaluations WHERE overall_score < 1 OR overall_score > 5` | 0 | __ | ☐ |
| salary_range_min > salary_range_max | `SELECT COUNT(*) FROM job_postings WHERE salary_range_min > salary_range_max` | 0 | __ | ☐ |
| **오타/이상값** |||||
| duration_minutes 이상값 | `SELECT COUNT(*) FROM interviews WHERE duration_minutes > 300 OR duration_minutes < 5` | < 5% | __% | ☐ |
| 미래 날짜 | `SELECT COUNT(*) FROM applications WHERE applied_at > NOW()` | 0 | __ | ☐ |

---

## 3. 온톨로지 핵심 엔티티 추출 가능성 평가

### 3.1 MVP Use Case 1 (프로세스 병목 진단) 필수 데이터

**필요한 데이터**:
1. Application.id, job_posting_id, current_stage, status
2. Stage_Transition.from_stage, to_stage, transitioned_at
3. Job_Posting.title, department
4. Historical_Benchmark (계산 가능 여부)

#### 추출 가능성 체크

| 요구사항 | 현재 데이터로 가능? | 대안/조치 |
|----------|-------------------|-----------|
| 각 Application의 현재 단계 | ☐ Yes ☐ No | |
| 단계별 전환 이력 | ☐ Yes (stage_transitions) ☐ No | 대안: application status update logs |
| 단계별 소요 시간 계산 | ☐ Yes ☐ No | |
| 역할별 평균 리드타임 (벤치마크) | ☐ Yes ☐ No | 대안: 수동 계산 후 입력 |
| 병목 책임자 식별 | ☐ Yes ☐ No | 대안: hiring_manager 또는 interviewer 추론 |

**종합 판단**: ☐ 가능 ☐ 부분 가능 (조치 필요) ☐ 불가능

---

### 3.2 MVP Use Case 2 (위험 시그널 알림) 필수 데이터

**필요한 데이터**:
1. Application 과거 이력 (동일 후보자의 이전 지원)
2. Evaluation.concerns, recommendation
3. Offer_Accept_Rate (역할별 또는 전체)
4. Rejection_Reason 패턴

#### 추출 가능성 체크

| 요구사항 | 현재 데이터로 가능? | 대안/조치 |
|----------|-------------------|-----------|
| 동일 후보자의 과거 지원 이력 | ☐ Yes ☐ No | |
| 평가 중 "concerns" 패턴 분석 | ☐ Yes ☐ No | 대안: overall_score만 사용 |
| 오퍼레터율 계산 | ☐ Yes ☐ No | |
| Rejection reason 구조화 | ☐ Yes ☐ No | 대안: 프리텍스트 NLP 처리 |

**종합 판단**: ☐ 가능 ☐ 부분 가능 (조치 필요) ☐ 불가능

---

## 4. 종합 평가 및 Go/No-Go 판단

### 4.1 고객별 종합 점수

| 고객 | 규모 | 완성도 | 일관성 | 노이즈 | 추출 가능성 | 종합 점수 | 등급 |
|------|------|--------|--------|--------|------------|----------|------|
| A | 50명 | __% | __% | __% | ☐☐☐ | __% | A/B/C/F |
| B | 150명 | __% | __% | __% | ☐☐☐ | __% | A/B/C/F |
| C | 300명 | __% | __% | __% | ☐☐☐ | __% | A/B/C/F |
| D | 500명 | __% | __% | __% | ☐☐☐ | __% | A/B/C/F |
| E | 1000명 | __% | __% | __% | ☐☐☐ | __% | A/B/C/F |
| **평균** | | __% | __% | __% | | **__%** | |

**종합 점수 계산**:
```
종합 = (완성도 × 0.5) + (일관성 × 0.3) + ((100 - 노이즈) × 0.2)
```

**등급 기준**:
- A: 80% 이상 (Excellent)
- B: 70-79% (Good) - MVP 가능
- C: 50-69% (Fair) - 데이터 정제 필요
- F: 50% 미만 (Poor) - 데이터 수집 자동화부터

---

### 4.2 Go/No-Go 판단 기준

#### ✅ GO (Phase 1 진행)
**조건**:
- 종합 점수 **70% 이상**
- 5개 고객 중 **3개 이상**이 B등급 이상
- MVP Use Case 1, 2 모두 **"가능" 또는 "부분 가능"**

**다음 단계**:
- Week 5-6: 온톨로지 워크샵 진행
- 데이터 정제 계획 수립 (필요시)

---

#### ⚠️ PIVOT (범위 축소 또는 데이터 정제)
**조건**:
- 종합 점수 **50-70%**
- 또는 MVP Use Case 1이 "부분 가능"

**조치사항**:
1. **데이터 정제 프로세스 추가** (2주 소요)
   - 중복 제거, 형식 표준화
   - 누락 필드 수동 입력 (중요 필드만)
2. **MVP 범위 축소**
   - Use Case 2 (위험 시그널) 제거
   - Use Case 1 (병목 진단)만 집중
3. **재감사** (Week 5)
   - 정제 후 품질 70% 이상 → GO
   - 여전히 70% 미만 → STOP

---

#### ❌ STOP (전략 재검토)
**조건**:
- 종합 점수 **50% 미만**
- 또는 MVP Use Case 1이 "불가능"

**근본 원인 분석**:
- 데이터 입력 프로세스가 없음 (자동화 부재)
- ATS 사용률이 낮음 (Notion, Google Sheets 병용)
- 필수 필드가 선택 필드로 되어 있음

**대안 전략**:
1. **데이터 수집 자동화부터 구축** (3-6개월)
   - 이메일/Slack 연동, 자동 파싱
   - 면접 녹취 → 자동 요약
   - 필수 필드 강제화
2. **MVP를 간단한 알림 기능으로 피봇**
   - 온톨로지 없이 규칙 기반 알림
   - "5일 이상 팔로업 없음" 같은 단순 로직
3. **보리(HR 실무자)의 MVP 제안 채택**
   - 기존 ATS 연동 + 오퍼레터 리스크 알림 + 액션 리마인더
   - 온톨로지는 Wave 2로 연기

---

## 5. 실행 체크리스트

### Week 1 (현재)
- [ ] 이 템플릿을 Backend Lead, Data Engineer와 리뷰
- [ ] 샘플 데이터 추출 요청 이메일 발송
- [ ] 5개 고객 선정 (규모 다양)
- [ ] 데이터 수령 예정일 확인: 2025-12-16 (월)

### Week 3 (12/16-12/20)
- [ ] 12/16 (월): 샘플 데이터 수령
- [ ] 12/17 (화): 필드 완성도 측정 (5개 고객)
- [ ] 12/17 (화): 일관성 체크 (쿼리 실행)
- [ ] 12/18 (수): 노이즈 레벨 측정
- [ ] 12/18 (수): 추출 가능성 평가
- [ ] 12/19 (목): 종합 점수 계산 및 Go/No-Go 판단
- [ ] 12/19 (목): 판단 근거 문서 작성
- [ ] 12/20 (금): Stakeholder 리뷰 미팅

### 산출물
- [ ] 데이터 품질 리포트 (10-15 페이지)
- [ ] 고객별 스코어카드 (5개)
- [ ] Go/No-Go 판단서 (1-pager)
- [ ] 온톨로지 스키마 v0.1 (가능한 경우)

---

## 6. 템플릿 사용 가이드

### 6.1 데이터 수령 후

1. **CSV/JSON 파일을 열어서 육안 확인**
   - 첫 10개 레코드를 보고 "이 데이터가 현실적인가?" 판단
   - 익명화가 제대로 되었는지 확인

2. **SQL 또는 Python으로 자동 측정**
   ```python
   import pandas as pd

   # 완성도 측정
   df = pd.read_csv('customer_A_candidates.csv')
   completeness = (df.notnull().sum() / len(df)) * 100
   print(completeness)

   # 중복 확인
   duplicates = df[df.duplicated(subset=['email'], keep=False)]
   print(f"중복: {len(duplicates)} / {len(df)}")
   ```

3. **스코어카드 작성**
   - 이 템플릿을 복사하여 실제 수치 입력
   - 통과/실패 체크

4. **종합 판단**
   - 5개 고객 평균 점수
   - GO/PIVOT/STOP 결정
   - 근거 문서 작성

### 6.2 Stakeholder 리뷰 준비

**1-pager 구조**:
```
제목: 데이터 품질 감사 결과 및 Go/No-Go 판단

1. 요약 (1문장)
   - "평균 품질 X%, 판단: GO/PIVOT/STOP"

2. 주요 발견 (3-5 bullet points)
   - "완성도: 중견기업(B, C)은 양호(75%), 대기업(E)은 부족(55%)"
   - "일관성: 참조 무결성은 완벽, 상태 일관성에 일부 문제"
   - "노이즈: interview_type 값이 20종류로 표준화 필요"

3. 고객별 상세 (표)
   - 5개 고객 스코어카드 요약

4. 판단 및 다음 단계
   - GO: "온톨로지 워크샵 진행 (Week 5-6)"
   - PIVOT: "데이터 정제 2주 추가, Use Case 축소"
   - STOP: "데이터 수집 자동화부터 구축"

5. 리스크 및 완화책
   - "대기업 데이터 품질 낮음 → 파일럿에서 제외 고려"
```

---

**이 템플릿으로 Week 3에 냉정한 Go/No-Go 판단을 하세요!** 🎯
