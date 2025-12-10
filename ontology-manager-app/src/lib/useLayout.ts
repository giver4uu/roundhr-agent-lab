
import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import dagre from 'dagre';
import { useOntologyStore } from '../stores/useOntologyStore';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Node dimensions for layout calculation
const NODE_WIDTH = 250;
const NODE_HEIGHT = 150;

export const useLayout = () => {
    // We use store actions to persist the layout changes
    // But for layout animation we might want to use reactflow state, 
    // however for a "Snap to Graph" action, updating the store is correct.
    const { onNodesChange } = useOntologyStore();
    const { getNodes, getEdges } = useReactFlow();

    const onLayout = useCallback((direction = 'TB') => {
        const nodes = getNodes();
        const edges = getEdges();

        dagreGraph.setGraph({ rankdir: direction });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        // Map layouted positions back to nodes
        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            // Dagre gives center point, ReactFlow expects top-left
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - NODE_WIDTH / 2,
                    y: nodeWithPosition.y - NODE_HEIGHT / 2,
                },
            };
        });

        // Trigger update
        // We trigger an explicit change event for all nodes
        onNodesChange(
            layoutedNodes.map(node => ({
                id: node.id,
                type: 'position',
                position: node.position
            } as any))
        );
    }, [getNodes, getEdges, onNodesChange]);

    return { onLayout };
};
