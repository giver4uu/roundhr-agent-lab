import { useState } from 'react';
import { useOntologyStore } from '../stores/useOntologyStore';
import { useTranslation } from 'react-i18next';
import { X, Play, CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';
import { cn } from '../lib/utils';

// Usage Pattern Definitions based on Use Case Catalog
const QUERY_PATTERNS = [
    {
        id: 'UC-007',
        keywords: ['bottleneck', 'delay', 'stage', 'process', 'slow', '병목', '지연', '단계', '프로세스'],
        requiredNodes: ['Application', 'Recruitment Stage'],
        description: 'Process Bottleneck Diagnosis',
        cypher: `MATCH (a:Application)-[:PROGRESSES_TO]->(s:Recruitment_Stage)\nWITH s, avg(a.duration) as avg_time\nWHERE avg_time > s.benchmark\nRETURN s.name, avg_time, "Bottleneck Detected"`
    },
    {
        id: 'UC-011',
        keywords: ['reminder', 'follow up', 'action', 'schedule', 'todo', '리마인더', '팔로업', '할일', '일정', 'task'],
        requiredNodes: ['Application', 'Task', 'Recruiter'],
        description: 'Next Action Reminder',
        cypher: `MATCH (r:Recruiter)-[:ASSIGNS]->(a:Application)\nWHERE a.last_contact > 5 days\nRETURN r.name, a.candidate_name, "Action Required"`
    },
    {
        id: 'UC-003',
        keywords: ['re-applicant', 'history', 'previous', 'again', 'duplicate', '재지원', '이력', '과거', '중복', 'applicant'],
        requiredNodes: ['Candidate', 'Application'],
        description: 'Re-applicant Context',
        cypher: `MATCH (c:Candidate)<-[:CREATES]-(a:Application)\nWITH c, count(a) as app_count\nWHERE app_count > 1\nRETURN c.name, prev_a.outcome`
    },
    {
        id: 'UC-008',
        keywords: ['feedback', 'late', 'interviewer', 'evaluation', 'submit', '피드백', '늦음', '면접관', '평가'],
        requiredNodes: ['Interview', 'Evaluation', 'Interviewer'],
        description: 'Interviewer Feedback Delay',
        cypher: `MATCH (i:Interview)-[:EVALUATES]->(c:Candidate)\nWHERE i.status = 'Completed' AND NOT (i)-[:HAS_EVALUATION]->()\nRETURN i.interviewer, "Feedback Missing"`
    }
];

// Synonyms map for better NLP alignment
const SYNONYM_MAP: Record<string, string> = {
    'applicant': 'Candidate',
    'candidate': 'Candidate',
    '지원자': 'Candidate',
    'interview': 'Interview',
    '면접': 'Interview',
    'evaluation': 'Evaluation',
    '평가': 'Evaluation',
    'job': 'Job Posting',
    'posting': 'Job Posting',
    '공고': 'Job Posting',
    'recruiter': 'Recruiter',
    '담당자': 'Recruiter',
    'application': 'Application',
    '지원서': 'Application',
    'stage': 'Recruitment Stage',
    '단계': 'Recruitment Stage'
};

export const Simulator = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();
    const { nodes } = useOntologyStore();
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState<any>(null);

    const analyzeQuestion = () => {
        const lowerQ = question.toLowerCase();

        // 1. Tokenize and Map Concepts
        const tokens = lowerQ.split(/[\s,.?]+/).filter(t => t.length > 1);
        const mappedConcepts: { term: string, node: string, found: boolean }[] = [];
        const existingLabels = new Set(nodes.map(n => n.data.label));

        tokens.forEach(token => {
            // Check direct match or synonym
            let targetNode = null;

            // 1. Direct label match (case insensitive)
            for (const label of existingLabels) {
                if (label.toLowerCase().includes(token)) targetNode = label;
            }

            // 2. Synonym lookup
            if (!targetNode) {
                // Find generic synonym match
                const synonymKey = Object.keys(SYNONYM_MAP).find(k => k.includes(token) || token.includes(k));
                if (synonymKey) targetNode = SYNONYM_MAP[synonymKey];
            }

            if (targetNode) {
                // Verify if this target node actually exists in the current ontology
                const exists = Array.from(existingLabels).some(l => l.toLowerCase() === targetNode?.toLowerCase());
                mappedConcepts.push({ term: token, node: targetNode, found: exists });
            }
        });

        const uniqueConcepts = Array.from(new Set(mappedConcepts.map(m => m.node)));
        const foundCount = mappedConcepts.filter(m => m.found).length;
        const totalCount = mappedConcepts.length;
        const confidence = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

        // 2. Identify Best Fit Use Case Pattern
        const matchedPattern = QUERY_PATTERNS.find(p =>
            p.keywords.some(k => lowerQ.includes(k.toLowerCase()))
        ) || null;

        let status = 'fail';
        let feedbackMsg = '';

        if (matchedPattern) {
            // Check if required nodes for this pattern exist
            const missing = matchedPattern.requiredNodes.filter(req =>
                !Array.from(existingLabels).some(l => l.toLowerCase() === req.toLowerCase())
            );

            if (missing.length === 0) {
                status = 'success';
                feedbackMsg = "Perfect Match! Query generation possible.";
            } else {
                status = 'partial';
                feedbackMsg = `Matched pattern '${matchedPattern.description}' but missing nodes: ${missing.join(', ')}`;
            }
        } else {
            // Fallback to concept coverage
            if (uniqueConcepts.length >= 2 && confidence > 50) {
                status = 'partial';
                feedbackMsg = "Generic query possible based on identified concepts.";
            } else {
                status = 'fail';
                feedbackMsg = "Cannot interpret question. No relevant concepts found.";
            }
        }

        setResult({
            status,
            feedbackMsg,
            confidence: Math.round(confidence),
            mappedConcepts,
            matchedPattern,
            generatedQuery: matchedPattern ? matchedPattern.cypher :
                (uniqueConcepts.length > 0 ? `MATCH (n) WHERE n.label IN [${uniqueConcepts.map(c => `'${c}'`).join(', ')}] RETURN n` : '// No query generated')
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Play className="w-5 h-5 text-blue-600" />
                        Use Case Simulator
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-900">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('simulator_question_label') || "Ask a question to verify if the ontology supports it:"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
                                placeholder={t('simulator_placeholder') || "e.g., How can I find bottlenecks in the hiring process?"}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && analyzeQuestion()}
                            />
                            <button
                                onClick={analyzeQuestion}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                {t('simulate') || "Simulate"}
                            </button>
                        </div>
                    </div>

                    {result && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className={cn(
                                "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                                result.status === 'success' ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                                    result.status === 'partial' ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
                                        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            )}>
                                {result.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" /> :
                                    result.status === 'partial' ? <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" /> :
                                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />}

                                <div>
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                        {result.status === 'success' ? "Query Generation Possible" :
                                            result.status === 'partial' ? "Incomplete Schema for Query" :
                                                "Natural Language Processing Failed"}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {result.feedbackMsg}
                                    </p>
                                </div>
                            </div>

                            {/* Concept Mapping Visualization */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">NLP Concept Mapping</span>
                                <div className="space-y-2">
                                    {result.mappedConcepts.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {result.mappedConcepts.map((m: any, idx: number) => (
                                                <div key={idx} className={cn(
                                                    "flex items-center gap-1.5 px-2 py-1 rounded text-xs border",
                                                    m.found
                                                        ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                        : "bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                                )}>
                                                    <span className="font-medium">"{m.term}"</span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className={cn("font-bold", !m.found && "line-through opacity-70")}>{m.node}</span>
                                                    {m.found ? <CheckCircle className="w-3 h-3 ml-0.5" /> : <XCircle className="w-3 h-3 ml-0.5" />}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic">No ontology concepts detected in question.</div>
                                    )}
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Schema Confidence:</span>
                                    <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500",
                                                result.confidence > 80 ? "bg-green-500" :
                                                    result.confidence > 50 ? "bg-yellow-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${result.confidence}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">{result.confidence}%</span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute top-0 right-0 p-2">
                                    <Database className="w-4 h-4 text-slate-400" />
                                </div>
                                <pre className="bg-slate-900 text-slate-200 p-4 rounded-md text-sm font-mono overflow-x-auto border border-slate-700">
                                    <code>{result.generatedQuery}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
