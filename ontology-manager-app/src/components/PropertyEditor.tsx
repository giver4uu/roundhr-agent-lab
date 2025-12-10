import { useState, useMemo } from 'react';
import { useOntologyStore } from '../stores/useOntologyStore';
import { cn } from '../lib/utils';
import {
    X, Plus, Trash2, Settings2, ShieldAlert,
    ChevronRight, ChevronDown, Check, Info
} from 'lucide-react';
import { PropertyDefinition, LogicRule } from '../types/ontology';
import { useTranslation } from 'react-i18next';
import * as Tooltip from '@radix-ui/react-tooltip';

// Simple tooltip wrapper since we don't have full UI library
const HelpTooltip = ({ content, children }: { content: string, children: React.ReactNode }) => (
    <Tooltip.Provider>
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                {children}
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content className="max-w-xs bg-slate-800 border border-slate-700 text-slate-300 text-xs p-2 rounded shadow-xl select-none z-50 animate-in fade-in zoom-in-95" sideOffset={5}>
                    {content}
                    <Tooltip.Arrow className="fill-slate-800" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    </Tooltip.Provider>
);

const PropertyEditor = () => {
    const { t } = useTranslation();
    const {
        nodes,
        edges,
        selectedNodeId,
        selectedEdgeId,
        selectNode,
        selectEdge,
        updateNodeLabel,
        updateNodeDescription,
        addProperty,
        removeProperty,
        addRule,
        removeRule,
        updateEdge,
        removeEdge,
        removeNode
    } = useOntologyStore();

    const [activeTab, setActiveTab] = useState<'properties' | 'rules'>('properties');

    const selectedNode = useMemo(() =>
        nodes.find(n => n.id === selectedNodeId),
        [nodes, selectedNodeId]);

    const selectedEdge = useMemo(() =>
        edges.find(e => e.id === selectedEdgeId),
        [edges, selectedEdgeId]);

    const handleAddProperty = () => {
        if (!selectedNode) return;
        const newProp: PropertyDefinition = {
            id: `prop_${Date.now()}`,
            name: 'new_property',
            type: 'text',
            required: false
        };
        addProperty(selectedNode.id, newProp);
    };

    const handleAddRule = () => {
        if (!selectedNode) return;
        const newRule: LogicRule = {
            id: `rule_${Date.now()}`,
            type: 'validation',
            description: 'New validation rule',
            value: ''
        };
        addRule(selectedNode.id, newRule);
    };

    if (selectedEdge) {
        const sourceNode = nodes.find(n => n.id === selectedEdge.source);
        const targetNode = nodes.find(n => n.id === selectedEdge.target);

        return (
            <div className="flex h-full w-96 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-colors">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
                    <div>
                        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Relationship</h2>
                        <input
                            className="mt-1 w-full bg-transparent text-lg font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1"
                            value={(selectedEdge.data?.label || selectedEdge.label || '') as string}
                            onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
                        />
                        <textarea
                            className="mt-2 w-full bg-transparent text-xs text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1 resize-none"
                            placeholder={t('add_description') || "Add description..."}
                            value={selectedEdge.data?.description || ''}
                            onChange={(e) => updateEdge(selectedEdge.id, { description: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <button
                        onClick={() => selectEdge(null)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Source -> Target Visualization */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 dark:text-blue-400 text-xs font-bold">Src</div>
                            <span className="text-[10px] mt-1 text-slate-500 dark:text-slate-400 max-w-[80px] truncate">{sourceNode?.data.label || 'Source'}</span>
                        </div>
                        <div className="flex-1 px-3 flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 mb-1">{selectedEdge.data?.cardinality || '1:1'}</span>
                            <div className="h-px w-full bg-slate-300 dark:bg-slate-600 relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-slate-300 dark:border-l-slate-600 border-b-[3px] border-b-transparent"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">Tgt</div>
                            <span className="text-[10px] mt-1 text-slate-500 dark:text-slate-400 max-w-[80px] truncate">{targetNode?.data.label || 'Target'}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">{t('rule_cardinality')}</label>
                            <HelpTooltip content={t('rule_cardinality_desc')}>
                                <Info className="w-3 h-3 text-slate-400 cursor-help" />
                            </HelpTooltip>
                        </div>
                        <select
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded text-xs text-slate-700 dark:text-slate-300 py-2 focus:ring-1 focus:ring-blue-500 transition-colors"
                            value={selectedEdge.data?.cardinality || '1:1'}
                            onChange={(e) => updateEdge(selectedEdge.id, { cardinality: e.target.value as any })}
                        >
                            <option value="1:1">1:1 (One-to-One)</option>
                            <option value="1:N">1:N (One-to-Many)</option>
                            <option value="N:1">N:1 (Many-to-One)</option>
                            <option value="N:M">N:M (Many-to-Many)</option>
                        </select>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => removeEdge(selectedEdge.id)}
                            className="flex w-full items-center justify-center gap-2 rounded border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Remove Relationship
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!selectedNode) {
        return (
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors">
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-4">
                    <Settings2 className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-medium">Select a class or relationship</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-96 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
                <div>
                    <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inspector</h2>
                    <input
                        className="mt-1 w-full bg-transparent text-lg font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1"
                        value={selectedNode.data.label}
                        onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
                    />
                    <textarea
                        className="mt-1 w-full bg-transparent text-xs text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded px-1 -mx-1 resize-none"
                        placeholder={t('add_description') || "Add description..."}
                        value={selectedNode.data.description || ''}
                        onChange={(e) => updateNodeDescription(selectedNode.id, e.target.value)}
                        rows={2}
                    />
                </div>
                <button
                    onClick={() => selectNode(null)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('properties')}
                    className={cn(
                        "flex-1 border-b-2 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === 'properties'
                            ? "border-blue-500 text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/5"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                >
                    {t('properties_tab')}
                    <HelpTooltip content={t('properties_help_desc')}>
                        <Info className="w-3 h-3 opacity-50 hover:opacity-100" />
                    </HelpTooltip>
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={cn(
                        "flex-1 border-b-2 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                        activeTab === 'rules'
                            ? "border-blue-500 text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/5"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                >
                    {t('rules_tab')}
                    <HelpTooltip content={t('rules_help_desc')}>
                        <Info className="w-3 h-3 opacity-50 hover:opacity-100" />
                    </HelpTooltip>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'properties' ? (
                    <div className="space-y-4">
                        {selectedNode.data.properties.map((prop: PropertyDefinition) => (
                            <PropertyRow
                                key={prop.id}
                                nodeId={selectedNode.id}
                                property={prop}
                                onDelete={() => removeProperty(selectedNode.id, prop.id)}
                            />
                        ))}

                        <button
                            onClick={handleAddProperty}
                            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-slate-300 dark:border-slate-700 py-3 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            {t('add_property')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedNode.data.rules.map((rule: LogicRule) => (
                            <RuleRow
                                key={rule.id}
                                nodeId={selectedNode.id}
                                rule={rule}
                                onDelete={() => removeRule(selectedNode.id, rule.id)}
                            />
                        ))}

                        <button
                            onClick={handleAddRule}
                            className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-slate-300 dark:border-slate-700 py-3 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <ShieldAlert className="h-4 w-4" />
                            {t('add_rule')}
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors">
                <button
                    onClick={() => removeNode(selectedNode.id)}
                    className="flex w-full items-center justify-center gap-2 rounded border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                    {t('delete_class') || 'Delete Class'}
                </button>
            </div>
        </div>
    );
};

const PropertyRow = ({ nodeId, property, onDelete }: { nodeId: string, property: PropertyDefinition, onDelete: () => void }) => {
    const { t } = useTranslation();
    const { updateProperty } = useOntologyStore();
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                <input
                    className="flex-1 bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                    value={property.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateProperty(nodeId, property.id, { name: e.target.value })}
                />
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {isExpanded && (
                <div className="p-3 pt-0 space-y-3 border-t border-slate-200 dark:border-slate-800/50 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">{t('property_type')}</label>
                            <select
                                className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border-none rounded text-xs text-slate-700 dark:text-slate-300 py-1.5 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={property.type}
                                onChange={(e) => updateProperty(nodeId, property.id, { type: e.target.value as any })}
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="boolean">Boolean</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-1.5">
                            <label className="flex items-center cursor-pointer gap-2 select-none group/check">
                                <div className={cn(
                                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                    property.required
                                        ? "bg-blue-600 border-blue-600"
                                        : "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 group-hover/check:border-slate-400 dark:group-hover/check:border-slate-500"
                                )}>
                                    {property.required && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={property.required}
                                    onChange={(e) => updateProperty(nodeId, property.id, { required: e.target.checked })}
                                />
                                <span className="text-xs text-slate-500 dark:text-slate-400 group-hover/check:text-slate-700 dark:group-hover/check:text-slate-300 transition-colors">{t('property_required')}</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">{t('description') || 'Description'}</label>
                        <input
                            className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border-none rounded text-xs text-slate-700 dark:text-slate-300 py-1.5 px-2 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder={t('add_description') || "Description..."}
                            value={property.description || ''}
                            onChange={(e) => updateProperty(nodeId, property.id, { description: e.target.value })}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

const RuleRow = ({ nodeId, rule, onDelete }: { nodeId: string, rule: LogicRule, onDelete: () => void }) => {
    const { t } = useTranslation();
    const { updateRule } = useOntologyStore();

    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900 p-3 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors relative group">
            <button onClick={onDelete} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-all">
                <Trash2 className="h-3.5 w-3.5" />
            </button>

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">{t('rule_type')}</label>
                    {/* Context sensitive help based on type */}
                    {rule.type === 'cardinality' && (
                        <HelpTooltip content={t('rule_cardinality_desc')}>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </HelpTooltip>
                    )}
                    {rule.type === 'disjoint' && (
                        <HelpTooltip content={t('rule_disjoint_desc')}>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </HelpTooltip>
                    )}
                    {rule.type === 'validation' && (
                        <HelpTooltip content={t('rule_validation_desc')}>
                            <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        </HelpTooltip>
                    )}
                </div>
                <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded text-xs text-slate-700 dark:text-slate-300 py-1.5 focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={rule.type}
                    onChange={(e) => updateRule(nodeId, rule.id, { type: e.target.value as any })}
                >
                    <option value="cardinality">{t('rule_cardinality')}</option>
                    <option value="disjoint">{t('rule_disjoint')}</option>
                    <option value="validation">{t('rule_validation')}</option>
                </select>
            </div>

            <div>
                <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Description</label>
                <input
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border-none rounded text-xs text-slate-700 dark:text-slate-300 py-1.5 px-2 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Describe the rule..."
                    value={rule.description}
                    onChange={(e) => updateRule(nodeId, rule.id, { description: e.target.value })}
                />
            </div>

            {rule.type === 'validation' && (
                <div>
                    <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Expression</label>
                    <div className="mt-1 relative">
                        <input
                            className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono text-green-600 dark:text-green-400 py-1.5 px-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="e.g. age > 18"
                            value={rule.value || ''}
                            onChange={(e) => updateRule(nodeId, rule.id, { value: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {rule.type === 'cardinality' && (
                <div>
                    <label className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Constraint</label>
                    <select
                        className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border-none rounded text-xs text-slate-700 dark:text-slate-300 py-1.5 focus:ring-1 focus:ring-blue-500 transition-colors"
                        value={rule.value || '1:1'}
                        onChange={(e) => updateRule(nodeId, rule.id, { value: e.target.value })}
                    >
                        <option value="1:1">1:1 (One-to-One)</option>
                        <option value="1:N">1:N (One-to-Many)</option>
                        <option value="N:1">N:1 (Many-to-One)</option>
                        <option value="N:M">N:M (Many-to-Many)</option>
                    </select>
                </div>
            )}
        </div>
    )
}

export default PropertyEditor;
