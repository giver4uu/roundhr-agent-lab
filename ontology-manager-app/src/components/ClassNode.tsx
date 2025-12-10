import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { OntologyNodeData } from '../types/ontology';
import { cn } from '../lib/utils';
import { Database, Key, LayoutGrid } from 'lucide-react';

const ClassNode = ({ data, selected }: NodeProps<OntologyNodeData>) => {
    return (
        <div
            className={cn(
                "min-w-[240px] rounded-md border bg-white dark:bg-slate-900 shadow-xl transition-all duration-200",
                selected
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10">
                    <Database className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {data.label}
                    </h3>
                    <p className="truncate text-[10px] text-slate-500 dark:text-slate-400" title={data.description}>
                        {data.description || 'Class'}
                    </p>
                </div>
                <LayoutGrid className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>

            {/* Properties List */}
            <div className="p-2 space-y-1">
                {data.properties.length > 0 ? (
                    data.properties.map((prop) => (
                        <div
                            key={prop.id}
                            className="group flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {prop.required && (
                                    <Key className="h-3 w-3 shrink-0 text-amber-500/70" />
                                )}
                                <span className={cn(
                                    "truncate font-medium",
                                    prop.required ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
                                )}>
                                    {prop.name}
                                </span>
                            </div>
                            <span className="shrink-0 font-mono text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400">
                                {prop.type}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="px-2 py-3 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                        No properties defined
                    </div>
                )}
            </div>

            {/* Rules Indicator (Footer) */}
            {data.rules.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {data.rules.length} active rules
                    </p>
                </div>
            )}

            {/* Handles - All Source to allow dragging from anywhere (requires ConnectionMode.Loose) */}
            <Handle
                type="source"
                position={Position.Top}
                id="top"
                className="!h-3 !w-3 !bg-slate-400 !border-slate-200 dark:!border-slate-900 transition-colors hover:!bg-blue-500 opacity-0 group-hover:opacity-100"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="!h-3 !w-3 !bg-slate-400 !border-slate-200 dark:!border-slate-900 transition-colors hover:!bg-blue-500 opacity-0 group-hover:opacity-100"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="!h-3 !w-3 !bg-slate-400 !border-slate-200 dark:!border-slate-900 transition-colors hover:!bg-blue-500 opacity-0 group-hover:opacity-100"
            />
            <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="!h-3 !w-3 !bg-slate-400 !border-slate-200 dark:!border-slate-900 transition-colors hover:!bg-blue-500 opacity-0 group-hover:opacity-100"
            />
        </div>
    );
};

export default memo(ClassNode);
