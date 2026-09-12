import { describe, it, expect } from 'vitest';
import { program } from '../src/cli/commands.js';

describe('Smoke Test', () => {
  it('should have the correct CLI name', () => {
    expect(program.name()).toBe('crypto-tracer');
  });
});
