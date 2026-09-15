import type { CanvasDocument } from './canvas.js';
import { topologicalSort } from './dag.js';

export interface ExecutionPlanStep {
  nodeId: string;
  nodeType: string;
  dependsOn: string[];
}

export function buildExecutionPlan(document: CanvasDocument): ExecutionPlanStep[] {
  const order = topologicalSort(
    document.nodes.map((node) => node.id),
    document.edges,
  );
  const nodes = new Map(document.nodes.map((node) => [node.id, node]));

  return order.map((nodeId) => {
    const node = nodes.get(nodeId);
    if (!node) {
      throw new Error(`Canvas node not found: ${nodeId}`);
    }

    return {
      nodeId,
      nodeType: node.type,
      dependsOn: document.edges.filter((edge) => edge.to === nodeId).map((edge) => edge.from),
    };
  });
}
