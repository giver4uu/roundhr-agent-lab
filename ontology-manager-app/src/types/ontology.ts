
export type PropertyType = 'text' | 'number' | 'date' | 'boolean';

export interface PropertyDefinition {
    id: string;
    name: string;
    type: PropertyType;
    required: boolean;
    description?: string;
}

export type Cardinality = '1:1' | '1:N' | 'N:1' | 'N:M';

export interface LogicRule {
    id: string;
    type: 'cardinality' | 'disjoint' | 'validation';
    targetId?: string; // For disjoint (with which class?) or validation target
    value?: string; // For validation rule text or cardinality value
    description: string;
}

export interface OntologyNodeData {
    label: string;
    properties: PropertyDefinition[];
    rules: LogicRule[];
    description?: string;
}

export interface OntologyEdgeData {
    label: string;
    cardinality: Cardinality;
    description?: string;
}
