import { describe, expect, it } from 'vitest';

import { buildExecutionPlan, validateCanvasDocument, WorkflowValidationError } from './index.js';

describe('workflow planning', () => {
  it('validates a canvas and returns a deterministic execution order', () => {
    const document = validateCanvasDocument({
      schemaVersion: 1,
      nodes: [
        { id: 'render', type: 'output' },
        { id: 'prompt', type: 'input' },
      ],
      edges: [{ from: 'prompt', to: 'render' }],
    });

    expect(buildExecutionPlan(document)).toEqual([
      { nodeId: 'prompt', nodeType: 'input', dependsOn: [] },
      { nodeId: 'render', nodeType: 'output', dependsOn: ['prompt'] },
    ]);
  });

  it('rejects a cyclic graph', () => {
    const document = validateCanvasDocument({
      nodes: [
        { id: 'a', type: 'input' },
        { id: 'b', type: 'output' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'a' },
      ],
    });

    expect(() => buildExecutionPlan(document)).toThrow(WorkflowValidationError);
  });
});
