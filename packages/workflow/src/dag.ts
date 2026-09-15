export interface DagEdge {
  from: string;
  to: string;
}

export class WorkflowValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowValidationError';
  }
}

export function topologicalSort(nodeIds: readonly string[], edges: readonly DagEdge[]): string[] {
  const ids = new Set(nodeIds);
  if (ids.size !== nodeIds.length) {
    throw new WorkflowValidationError('Canvas contains duplicate node IDs');
  }

  const outgoing = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const id of ids) {
    outgoing.set(id, []);
    indegree.set(id, 0);
  }

  for (const edge of edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      throw new WorkflowValidationError(
        `Canvas edge references an unknown node: ${edge.from} -> ${edge.to}`,
      );
    }

    outgoing.get(edge.from)?.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }

  const ready = [...ids].filter((id) => indegree.get(id) === 0).sort();
  const order: string[] = [];

  while (ready.length > 0) {
    const current = ready.shift();
    if (!current) {
      continue;
    }
    order.push(current);

    for (const next of outgoing.get(current) ?? []) {
      const nextIndegree = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, nextIndegree);
      if (nextIndegree === 0) {
        ready.push(next);
        ready.sort();
      }
    }
  }

  if (order.length !== ids.size) {
    throw new WorkflowValidationError('Canvas graph contains a cycle');
  }

  return order;
}
