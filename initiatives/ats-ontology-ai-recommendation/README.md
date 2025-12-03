# ATS 온톨로지 기반 AI 추천 시스템

## 📌 Overview

**이니셔티브 명칭**: ATS Ontology-based AI Recommendation System
**담당 PM**: Terry
**시작일**: 2025-12-03
**목표 기간**: 24주 (6개월)
**현재 상태**: Phase 0 - Discovery & Validation

---

## 🎯 비전 및 목표

### 제품 비전
기존 채용 플랫폼의 정적 데이터(학력, 경력, 연봉) 매칭을 넘어서, ATS가 보유한 동적 데이터(단계별 리드타임, 평가 내역, 면접 스크립트, 오퍼레터, 커뮤니케이션 내용)를 온톨로지로 구조화하여 지식그래프를 구축하고 LLM과 연결함으로써, AI가 맥락과 관계를 이해하여 채용 담당자에게 **똑똑한 비서**를 제공한다.

### 핵심 가치 제안
1. **인재 검증 정확도 향상**: AI가 암묵지 속에서 적합한 인재 검증
2. **프로액티브 인재 추천**: 데이터를 보고 능동적으로 좋은 인재 추천
3. **위험 시그널 알림**: 해당 인재 채용 시 위험 요소 사전 경고
4. **다음 액션 제안**: 채용 프로세스 최적화를 위한 구체적 액션 가이드

### 비즈니스 목표
- **6개월 목표**: MVP 출시 + 5개 파일럿 고객 검증
- **12개월 목표**: 20개 유료 고객 확보, ARR $X 달성
- **차별화 지표**: 채용 리드타임 30% 단축, Bad Hire 50% 감소

---

## 🔍 핵심 가정 (Assumptions to Test)

### 가정 1: 가치 가정 (최고 리스크)
**진술**: 채용 담당자는 프로액티브한 AI 인사이트(위험 알림, 후보자 추천)를 충분히 가치있게 여겨 행동을 바꿀 것이다.

**테스트 방법**: Wizard of Oz 테스트 (수동 인사이트 제공)
**성공 기준**: 30일 내 60% 이상 고객이 인사이트 기반 액션 1회 이상 실행
**현재 상태**: 미검증

### 가정 2: 사용성 가정 (높은 리스크)
**진술**: 리크루터가 현재 워크플로우를 크게 바꾸지 않고도 AI 기능을 일상에 통합할 수 있다.

**테스트 방법**: 프로토타입 관찰 (5명)
**성공 기준**: 70% 이상이 교육 없이 핵심 기능 3회 사용
**현재 상태**: 미검증

### 가정 3: 기술적 실현 가능성 (높은 리스크)
**진술**: 현재 데이터 품질과 구조로 의미있는 정확도의 온톨로지를 6개월 내 구축할 수 있다.

**테스트 방법**: 데이터 품질 감사 + PoC 스파이크
**성공 기준**: 70% 이상 데이터 품질, PoC에서 1개 use case 70% 정확도
**현재 상태**: **Week 3 진행 예정** ⚠️

### 가정 4: 경제성 가정 (중간 리스크)
**진술**: 고객이 이 기능에 대해 기존 ATS 비용의 30-50% 프리미엄을 지불할 의향이 있다.

**테스트 방법**: 가치 기반 가격 인터뷰 (Van Westendorp)
**성공 기준**: 40% 이상이 목표 가격 수용
**현재 상태**: 미검증

### 가정 5: 차별화 지속성 (중간 리스크)
**진술**: 온톨로지 접근은 네트워크 효과를 만들어 12-18개월 경쟁 우위를 유지할 수 있다.

**테스트 방법**: 경쟁사 기술 스택 분석 + 벤치마킹
**성공 기준**: 온톨로지가 핵심 메트릭에서 20% 이상 우수
**현재 상태**: 미검증

---

## 🗺️ 로드맵

### Phase 0: Discovery & Validation (Week 1-4) ← **현재 단계**
**목표**: 5가지 핵심 가정 검증 + 데이터 품질 확인

**주요 활동**:
- Week 1-2: 고객 발견 인터뷰 10명
- Week 3: 데이터 품질 감사 (5개 고객, 각 50-100 프로세스)
- Week 4: 경쟁 분석 & MVP 스코프 확정

**Exit Criteria**:
- [ ] 10개 인터뷰 완료, 3개 이상 명확한 Pain Point 패턴 발견
- [ ] 데이터 품질 70% 이상
- [ ] MVP 3개 Use Case에 대해 5명 이상 "이거 나오면 쓸게요" 반응
- [ ] 목표 가격에 40% 이상 수용성

### Phase 1: MVP Development (Week 5-12)
**목표**: 온톨로지 v1.0 + 3개 Use Case 구현

**주요 마일스톤**:
- Week 5-6: 온톨로지 설계 워크샵 (Schema v1.0)
- Week 7-10: 개발 Sprint (ETL + Use Case 구현)
- Week 11-12: 내부 테스트 & 정확도 측정 (목표: 70%)

**MVP Use Cases**:
1. ✅ **프로세스 병목 진단** (Core)
2. ✅ **위험 시그널 알림** (Core)
3. ✅ **다음 액션 리마인더** (보조)

**Non-goals**:
- ❌ 유사 후보자 추천 (Wave 2)
- ❌ AI 후보자 매칭 (Wave 3)

### Phase 2: Pilot & Refinement (Week 13-20)
**목표**: 5개 고객 파일럿 → 사용성/가치 검증

**파일럿 구조**:
- 8주 프로그램
- 주간 인사이트 리포트 발송
- 격주 30분 체크인 콜

**성공 기준**:
- 리포트 열람률 80% 이상
- 액션 전환율 30% 이상
- 정확도 피드백 70% "맞음"
- NPS 40 이상

### Phase 3: Scale Decision (Week 21-24)
**목표**: Go/No-Go 결정 + 로드맵 커뮤니케이션

**Decision Gate**:
- PRISM 5-Dimension 평균 3.5+ → GO (Wave 2 투자)
- 평균 2.5-3.5 → PIVOT (범위 축소)
- 평균 2.5 미만 → HOLD (전략 재검토)

---

## 👥 이해관계자 (Stakeholders)

| 역할 | 이름 | 책임 | 관여도 |
|------|------|------|--------|
| PM Lead | Terry | 전략, 고객 검증, 온톨로지 설계 | 100% |
| Backend Lead | [TBD] | 온톨로지 물리 스키마, API | 60% |
| Data Engineer | [TBD] | ETL 파이프라인, 데이터 품질 | 80% |
| AI/ML Engineer | [TBD] | LLM 통합, 추론 엔진 | 40% (Phase 2부터) |
| Design Lead | [TBD] | PM용 온톨로지 맵, 쿼리 빌더 UI | 30% |
| 파일럿 고객 | [5개사 TBD] | 피드백, 데이터 제공 | Week 13부터 |

---

## 📚 주요 문서

### 전략 문서
- [전문가 통합 분석](expert-analysis/00-integrated-analysis.md) - 제리, 보리, 포리 종합 인사이트
- [제리(PM) 분석](expert-analysis/01-jerry-pm-strategic-analysis.md) - B2B SaaS 전략 관점
- [보리(HR) 분석](expert-analysis/02-borry-hr-practitioner-validation.md) - HR 실무자 관점
- [포리(Ontology) 분석](expert-analysis/03-forry-ontology-architect-guide.md) - 온톨로지 설계 가이드

### 실행 문서
- [우선순위 분석 및 Next Actions](priorities-and-next-actions.md) - **즉시 실행 항목** ⚡
- [데이터 품질 감사 템플릿](tasks/data-quality-audit-template.md) - Week 3 필수
- [고객 인터뷰 가이드](user-interviews/interview-guide-phase0.md) - Week 1-2 사용

### 온톨로지 설계 (진행 중)
- [Ontology Schema v0.1](solutions/ontology-schema-v0.1.md) - 초안 (Week 5-6 확정)
- [Use Case Query Samples](solutions/use-case-queries.md) - 3개 Use Case별 쿼리

### 연구 데이터
- [Interview Snapshots](user-interviews/snapshots/) - 고객 인터뷰 인사이트
- [Synthesis](user-interviews/synthesis/) - 크로스 인터뷰 패턴 분석
- [Assumptions Log](assumptions/) - 가정 테스트 결과 추적

---

## 📊 현재 상태 요약 (2025-12-03 기준)

### 완료한 것 ✅
- ✅ 제리, 보리, 포리 전문가 분석 완료
- ✅ 통합 마스터 플랜 수립
- ✅ 이니셔티브 폴더 구조 생성
- ✅ 5가지 핵심 가정 정의

### 진행 중인 것 🚧
- 🚧 우선순위 분석 및 Next Actions 문서화
- 🚧 데이터 품질 감사 템플릿 작성
- 🚧 고객 인터뷰 가이드 작성

### 다음 48시간 할 일 ⚡
1. **오늘**:
   - 데이터 품질 감사 템플릿 완성
   - 고객 인터뷰 가이드 완성
   - 인터뷰 대상 10명 리스트 작성

2. **내일**:
   - 첫 3명 인터뷰 일정 잡기
   - 엔지니어팀에 샘플 데이터 추출 요청
   - Phase 0 Exit Criteria 경영진 정렬

---

## 🎓 핵심 학습 (Key Learnings)

### 온톨로지 프로젝트의 3가지 함정
1. **기술 중심 함정**: 온톨로지는 수단이지 목적이 아님. 고객 가치 우선.
2. **완벽주의 함정**: 100개 Object 설계보다 7개로 시작해서 진화.
3. **블랙박스 함정**: B2B 구매자에게 기술 용어는 의미 없음. 비즈니스 결과로 설명.

### B2B SaaS AI 제품의 신뢰 공식
```
신뢰 = 설명 가능성 × 오버라이드 가능성 × 검증된 정확도
```
- "왜 이 추천을 하는가?" 5가지 이유 제시
- "아니요, 제가 직접 결정할게요" 버튼 제공
- 최소 3-6개월 실사용 데이터로 정확도 증명

### MVP의 진짜 의미
- Minimum이 아니라 **Viable**이 핵심
- 작아야 하지만 **스토리를 만들 수 있을 만큼**은 커야 함
- 병목 진단(기능) + 위험 시그널(가치) = 완전한 스토리

---

## 📞 연락처 및 리소스

**PM 연락처**: [Terry's Contact]
**Slack Channel**: #ats-ontology-ai
**Notion Workspace**: [Link TBD]
**주간 Sync**: 매주 금요일 15:00 (1시간)

**외부 리소스**:
- [Continuous Discovery Habits](https://www.producttalk.org/continuous-discovery-habits/) - 고객 리서치 프레임워크
- [Evidence-Guided](https://www.youtube.com/watch?v=aJWSn-tz3jQ) - Itamar Gilad
- [Palantir Ontology Documentation](https://www.palantir.com/docs/foundry/ontology/) - 온톨로지 설계 참고

---

**마지막 업데이트**: 2025-12-03
**다음 리뷰**: 2025-12-10 (Week 1 결과 리뷰)
