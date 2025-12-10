
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    Edge,
    Node,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
} from 'reactflow';
import { OntologyNodeData, OntologyEdgeData, PropertyDefinition, LogicRule } from '../types/ontology';

interface OntologyState {
    nodes: Node<OntologyNodeData>[];
    edges: Edge<OntologyEdgeData>[];
    selectedNodeId: string | null;
    selectedEdgeId: string | null;

    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    addNode: (node: Node<OntologyNodeData>) => void;
    removeNode: (id: string) => void;
    selectNode: (nodeId: string | null) => void;
    selectEdge: (edgeId: string | null) => void;
    updateNodeLabel: (nodeId: string, label: string) => void;
    updateNodeDescription: (nodeId: string, description: string) => void;

    // Property Actions
    addProperty: (nodeId: string, property: PropertyDefinition) => void;
    updateProperty: (nodeId: string, propertyId: string, updates: Partial<PropertyDefinition>) => void;
    removeProperty: (nodeId: string, propertyId: string) => void;

    // Rule Actions
    addRule: (nodeId: string, rule: LogicRule) => void;
    updateRule: (nodeId: string, ruleId: string, updates: Partial<LogicRule>) => void;
    removeRule: (nodeId: string, ruleId: string) => void;
}

// Initial Data based on Use Case Catalog
const initialNodes: Node<OntologyNodeData>[] = [
    // Tier 1: Core Domain Objects
    {
        id: 'candidate',
        type: 'classNode',
        position: { x: 50, y: 300 },
        data: {
            label: 'Candidate',
            description: '채용 지원자 개인 (The central entity of recruitment)',
            properties: [
                { id: 'c1', name: 'name', type: 'text', required: true, description: '지원자 이름' },
                { id: 'c2', name: 'email', type: 'text', required: true, description: '이메일 주소 (Unique ID)' },
                { id: 'c3', name: 'phone', type: 'text', required: false, description: '연락처' },
                { id: 'c4', name: 'response_pattern', type: 'text', required: false, description: '평균 응답 패턴 및 성향' },
                { id: 'c5', name: 'avg_response_time', type: 'number', required: false, description: '평균 응답 소요 시간 (시간)' },
                { id: 'c6', name: 'current_status', type: 'text', required: true, description: '현재 채용 상태 (예: active, rejected)' },
            ],
            rules: []
        }
    },
    {
        id: 'job_posting',
        type: 'classNode',
        position: { x: 450, y: 50 },
        data: {
            label: 'Job Posting',
            description: '채용 공고 (Target of the application)',
            properties: [
                { id: 'jp1', name: 'title', type: 'text', required: true, description: '공고 제목' },
                { id: 'jp2', name: 'department_id', type: 'text', required: true, description: '소속 부서 ID' },
                { id: 'jp3', name: 'status', type: 'text', required: true, description: '공고 상태 (Open, Closed)' },
                { id: 'jp4', name: 'salary_range', type: 'text', required: false, description: '급여 범위 예시' },
            ],
            rules: []
        }
    },
    {
        id: 'application',
        type: 'classNode',
        position: { x: 450, y: 300 },
        data: {
            label: 'Application',
            description: '지원 내역 (Linking Candidate to Job Posting)',
            properties: [
                { id: 'app1', name: 'applied_date', type: 'date', required: true, description: '지원 일자' },
                { id: 'app2', name: 'current_stage', type: 'text', required: true, description: '현재 진행 단계' },
                { id: 'app3', name: 'overall_status', type: 'text', required: true, description: '전체 진행 상태' },
                { id: 'app4', name: 'stage_entered_at', type: 'date', required: true, description: '현 단계 진입 일시' },
                { id: 'app5', name: 'rejection_reason', type: 'text', required: false, description: '탈락 사유 (있는 경우)' },
            ],
            rules: []
        }
    },
    {
        id: 'interview',
        type: 'classNode',
        position: { x: 850, y: 300 },
        data: {
            label: 'Interview',
            description: '면접 이벤트 (Scheduled event)',
            properties: [
                { id: 'int1', name: 'scheduled_date', type: 'date', required: true, description: '면접 예정 일시' },
                { id: 'int2', name: 'type', type: 'text', required: true, description: '면접 유형 (화상, 대면 등)' },
                { id: 'int3', name: 'status', type: 'text', required: true, description: '진행 상태 (Scheduled, Completed)' },
                { id: 'int4', name: 'actual_end_time', type: 'date', required: false, description: '실제 종료 시간' },
            ],
            rules: []
        }
    },
    {
        id: 'evaluation',
        type: 'classNode',
        position: { x: 1150, y: 300 },
        data: {
            label: 'Evaluation',
            description: '평가 기록 (Outcome of an interview)',
            properties: [
                { id: 'ev1', name: 'score', type: 'number', required: true, description: '평가 점수 (1-5)' },
                { id: 'ev2', name: 'feedback_text', type: 'text', required: true, description: '상세 피드백 내용' },
                { id: 'ev3', name: 'recommendation', type: 'text', required: true, description: '합격 여부 추천' },
                { id: 'ev4', name: 'submitted_at', type: 'date', required: true, description: '평가 제출 일시' },
            ],
            rules: []
        }
    },

    // Tier 2: Process Management Objects
    {
        id: 'recruitment_stage',
        type: 'classNode',
        position: { x: 450, y: 600 },
        data: {
            label: 'Recruitment Stage',
            description: '채용 단계 정의 (Pipeline steps)',
            properties: [
                { id: 'rs1', name: 'stage_name', type: 'text', required: true, description: '단계 명칭' },
                { id: 'rs2', name: 'avg_duration', type: 'number', required: false, description: '평균 소요 기간 (일)' },
                { id: 'rs3', name: 'sequence_order', type: 'number', required: true, description: '단계 순서' },
                { id: 'rs4', name: 'benchmark', type: 'number', required: true, description: '목표 소요 기간 (Benchmark)' },
            ],
            rules: []
        }
    },
    {
        id: 'stage_transition',
        type: 'classNode',
        position: { x: 250, y: 450 },
        data: {
            label: 'Stage Transition',
            description: '단계 이동 이벤트 (History log)',
            properties: [
                { id: 'st1', name: 'from_stage', type: 'text', required: true, description: '이전 단계' },
                { id: 'st2', name: 'to_stage', type: 'text', required: true, description: '이동한 단계' },
                { id: 'st3', name: 'timestamp', type: 'date', required: true, description: '이동 일시' },
                { id: 'st4', name: 'duration', type: 'number', required: true, description: '이전 단계 체류 시간' },
            ],
            rules: []
        }
    },
    {
        id: 'task',
        type: 'classNode',
        position: { x: 850, y: 550 },
        data: {
            label: 'Task',
            description: '채용 관련 할 일 (To-Do items)',
            properties: [
                { id: 't1', name: 'type', type: 'text', required: true, description: '작업 유형' },
                { id: 't2', name: 'due_date', type: 'date', required: true, description: '마감 기한' },
                { id: 't3', name: 'priority', type: 'text', required: true, description: '우선순위' },
                { id: 't4', name: 'status', type: 'text', required: true, description: '완료 여부' },
            ],
            rules: []
        }
    },
    {
        id: 'communication',
        type: 'classNode',
        position: { x: 50, y: 550 },
        data: {
            label: 'Communication',
            description: '커뮤니케이션 기록 (Emails, Calls)',
            properties: [
                { id: 'cm1', name: 'channel', type: 'text', required: true, description: '소통 채널' },
                { id: 'cm2', name: 'timestamp', type: 'date', required: true, description: '발송 일시' },
                { id: 'cm3', name: 'response_time', type: 'number', required: false, description: '응답 소요 시간' },
                { id: 'cm4', name: 'sender', type: 'text', required: true, description: '발신자' },
            ],
            rules: []
        }
    },

    // Tier 3: People Objects
    {
        id: 'recruiter',
        type: 'classNode',
        position: { x: 250, y: 800 },
        data: {
            label: 'Recruiter',
            description: '리크루터 (Hiring Staff)',
            properties: [
                { id: 'r1', name: 'name', type: 'text', required: true, description: '리크루터 이름' },
                { id: 'r2', name: 'assigned_positions', type: 'number', required: false, description: '담당 포지션 수' },
            ],
            rules: []
        }
    },
    {
        id: 'interviewer',
        type: 'classNode',
        position: { x: 1150, y: 550 },
        data: {
            label: 'Interviewer',
            description: '면접관 (Evaluator)',
            properties: [
                { id: 'i1', name: 'name', type: 'text', required: true, description: '면접관 이름' },
                { id: 'i2', name: 'email', type: 'text', required: true, description: '이메일' },
                { id: 'i3', name: 'avg_feedback_time', type: 'number', required: false, description: '평균 피드백 제출 시간' },
                { id: 'i4', name: 'monthly_count', type: 'number', required: false, description: '월간 면접 횟수' },
            ],
            rules: []
        }
    },

    // Tier 4: AI Objects
    {
        id: 'ai_recommendation',
        type: 'classNode',
        position: { x: 650, y: 800 },
        data: {
            label: 'AI Recommendation',
            description: 'AI 제안 및 알림 (Suggesions)',
            properties: [
                { id: 'ai1', name: 'type', type: 'text', required: true, description: '제안 유형 (Risk, Info)' },
                { id: 'ai2', name: 'confidence_score', type: 'number', required: true, description: 'AI 확신도 (0-1)' },
                { id: 'ai3', name: 'reasoning', type: 'text', required: true, description: '제안 근거 (Transparent reasoning)' },
                { id: 'ai4', name: 'suggested_action', type: 'text', required: true, description: '권장 행동' },
                { id: 'ai5', name: 'user_action', type: 'text', required: false, description: '사용자 반응 (Accepted/Ignored)' },
            ],
            rules: []
        }
    }
];

const initialEdges: Edge<OntologyEdgeData>[] = [
    // Core Flows
    { id: 'e_app_job', source: 'application', target: 'job_posting', label: 'FOR_POSITION', data: { label: 'FOR_POSITION', cardinality: 'N:1', description: '지원서가 특정 공고를 대상으로 함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_app_cand', source: 'application', target: 'candidate', label: 'CREATES', data: { label: 'CREATES', cardinality: '1:1', description: '지원서가 특정 지원자를 나타냄' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

    // Interview Process
    { id: 'e_int_app', source: 'interview', target: 'application', label: 'SCHEDULES', data: { label: 'SCHEDULES', cardinality: 'N:1', description: '면접이 특정 지원 건에 대해 잡힘' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_int_interviewer', source: 'interviewer', target: 'interview', label: 'PARTICIPATES_IN', data: { label: 'PARTICIPATES_IN', cardinality: 'N:M', description: '면접관이 면접에 참여함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

    // Evaluation
    { id: 'e_eval_int', source: 'evaluation', target: 'interview', label: 'RESULTS_FROM', data: { label: 'RESULTS_FROM', cardinality: '1:1', description: '평가는 특정 면접의 결과임' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_eval_cand', source: 'evaluation', target: 'candidate', label: 'EVALUATES', data: { label: 'EVALUATES', cardinality: 'N:1', description: '면접관이 후보자를 평가함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

    // Recruiter Management
    { id: 'e_rec_app', source: 'recruiter', target: 'application', label: 'ASSIGNS', data: { label: 'ASSIGNS', cardinality: '1:N', description: '리크루터가 지원 건을 담당함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_rec_comm', source: 'recruiter', target: 'communication', label: 'SENDS', data: { label: 'SENDS', cardinality: '1:N', description: '리크루터가 메시지를 보냄' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

    // Communication
    { id: 'e_comm_cand', source: 'communication', target: 'candidate', label: 'COMMUNICATES_WITH', data: { label: 'COMMUNICATES_WITH', cardinality: 'N:1', description: '메시지가 후보자와 관련됨' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

    // Recruitment Stages
    { id: 'e_stage_app', source: 'application', target: 'recruitment_stage', label: 'CURRENTLY_IN', data: { label: 'CURRENTLY_IN', cardinality: 'N:1', description: '지원서가 현재 특정 단계에 있음' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_trans_app', source: 'stage_transition', target: 'application', label: 'HAPPENS_TO', data: { label: 'HAPPENS_TO', cardinality: 'N:1', description: '단계 이동이 특정 지원 건에서 발생함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_trans_stage', source: 'stage_transition', target: 'recruitment_stage', label: 'PROGRESSES_TO', data: { label: 'PROGRESSES_TO', cardinality: 'N:1', description: '단계 이동으로 새로운 단계에 도달함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

    // AI
    { id: 'e_ai_app', source: 'ai_recommendation', target: 'application', label: 'RECOMMENDS_FOR', data: { label: 'RECOMMENDS_FOR', cardinality: 'N:1', description: 'AI가 특정 지원 건에 대해 제안함' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e_ai_eval', source: 'ai_recommendation', target: 'evaluation', label: 'VALIDATED_BY', data: { label: 'VALIDATED_BY', cardinality: 'N:1', description: 'AI 제안이 실제 평가 결과로 검증됨' }, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
];

interface OntologyState {
    nodes: Node<OntologyNodeData>[];
    edges: Edge<OntologyEdgeData>[];
    selectedNodeId: string | null;
    selectedEdgeId: string | null;

    // Actions
    selectNode: (id: string | null) => void;
    selectEdge: (id: string | null) => void;
    addNode: (node: Node<OntologyNodeData>) => void;
    updateNodeLabel: (id: string, label: string) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Node Properties
    addProperty: (nodeId: string, property: PropertyDefinition) => void;
    removeProperty: (nodeId: string, propertyId: string) => void;
    updateProperty: (nodeId: string, propertyId: string, updates: Partial<PropertyDefinition>) => void;

    // Node Rules
    addRule: (nodeId: string, rule: LogicRule) => void;
    removeRule: (nodeId: string, ruleId: string) => void;
    updateRule: (nodeId: string, ruleId: string, updates: Partial<LogicRule>) => void;

    // Edge Properties
    updateEdge: (id: string, data: Partial<OntologyEdgeData>) => void;
    removeEdge: (id: string) => void;
}

export const useOntologyStore = create<OntologyState>()(
    persist(
        (set, get) => ({
            nodes: initialNodes,
            edges: initialEdges,
            selectedNodeId: null,
            selectedEdgeId: null,

            selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
            selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

            addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

            removeNode: (id) =>
                set((state) => ({
                    nodes: state.nodes.filter((n) => n.id !== id),
                    edges: state.edges.filter((e) => e.source !== id && e.target !== id),
                    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
                })),

            updateNodeLabel: (id, label) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === id ? { ...node, data: { ...node.data, label } } : node
                    ),
                })),

            updateNodeDescription: (id, description) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === id ? { ...node, data: { ...node.data, description } } : node
                    ),
                })),

            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },

            onConnect: (connection) => {
                if (!connection.source || !connection.target) return;

                const edge: Edge<OntologyEdgeData> = {
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: connection.sourceHandle,
                    targetHandle: connection.targetHandle,
                    id: `e_${Date.now()} `,
                    type: 'smoothstep',
                    label: 'RELATION',
                    data: {
                        label: 'RELATION',
                        cardinality: '1:1'
                    },
                    markerEnd: { type: MarkerType.ArrowClosed }
                };
                set({ edges: addEdge(edge, get().edges) });
            },

            addProperty: (nodeId, property) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === nodeId
                            ? { ...node, data: { ...node.data, properties: [...node.data.properties, property] } }
                            : node
                    ),
                })),

            removeProperty: (nodeId, propertyId) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === nodeId
                            ? {
                                ...node,
                                data: {
                                    ...node.data,
                                    properties: node.data.properties.filter((p) => p.id !== propertyId),
                                },
                            }
                            : node
                    ),
                })),

            updateProperty: (nodeId, propertyId, updates) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === nodeId
                            ? {
                                ...node,
                                data: {
                                    ...node.data,
                                    properties: node.data.properties.map((p) =>
                                        p.id === propertyId ? { ...p, ...updates } : p
                                    ),
                                },
                            }
                            : node
                    ),
                })),

            addRule: (nodeId, rule) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === nodeId
                            ? { ...node, data: { ...node.data, rules: [...node.data.rules, rule] } }
                            : node
                    ),
                })),

            removeRule: (nodeId, ruleId) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === nodeId
                            ? {
                                ...node,
                                data: {
                                    ...node.data,
                                    rules: node.data.rules.filter((r) => r.id !== ruleId),
                                },
                            }
                            : node
                    ),
                })),

            updateRule: (nodeId, ruleId, updates) =>
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === nodeId
                            ? {
                                ...node,
                                data: {
                                    ...node.data,
                                    rules: node.data.rules.map((r) =>
                                        r.id === ruleId ? { ...r, ...updates } : r
                                    ),
                                },
                            }
                            : node
                    ),
                })),

            updateEdge: (id, data) =>
                set((state) => ({
                    edges: state.edges.map((edge) => {
                        if (edge.id !== id) return edge;

                        const newLabel = data.label !== undefined ? data.label : (typeof edge.label === 'string' ? edge.label : 'RELATION');
                        const newData: OntologyEdgeData = {
                            label: newLabel,
                            cardinality: data.cardinality || edge.data?.cardinality || '1:1',
                            description: data.description !== undefined ? data.description : edge.data?.description
                        };

                        return {
                            ...edge,
                            label: newLabel,
                            data: newData
                        };
                    }),
                })),

            removeEdge: (id) =>
                set((state) => ({
                    edges: state.edges.filter((edge) => edge.id !== id),
                    selectedEdgeId: null
                })),
        }),
        {
            name: 'ontology-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
            version: 1,
            migrate: (persistedState: any, version) => {
                if (version === 0) {
                    // Migration from v0 to v1: Backfill descriptions from initialNodes
                    const newNodes = persistedState.nodes.map((pNode: any) => {
                        const templateNode = initialNodes.find(iNode => iNode.id === pNode.id);
                        if (templateNode) {
                            return {
                                ...pNode,
                                data: {
                                    ...pNode.data,
                                    description: templateNode.data.description, // Backfill description
                                    properties: pNode.data.properties.map((pProp: any) => {
                                        const templateProp = templateNode.data.properties.find(tProp => tProp.id === pProp.id);
                                        return templateProp ? { ...pProp, description: templateProp.description } : pProp;
                                    })
                                }
                            };
                        }
                        return pNode;
                    });

                    const newEdges = persistedState.edges.map((pEdge: any) => {
                        const templateEdge = initialEdges.find(iEdge => iEdge.id === pEdge.id);
                        if (templateEdge) {
                            return {
                                ...pEdge,
                                data: {
                                    ...pEdge.data,
                                    description: templateEdge.data?.description
                                }
                            }
                        }
                        return pEdge;
                    });

                    return {
                        ...persistedState,
                        nodes: newNodes,
                        edges: newEdges
                    };
                }
                return persistedState;
            },
        }
    )
);

