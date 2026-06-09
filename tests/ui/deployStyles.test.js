import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeStyle = readFileSync('style.css', 'utf8');
const deployStyle = readFileSync('public/style.css', 'utf8');

describe('deployed stylesheet', () => {
  it('keeps the local and public stylesheets in sync', () => {
    expect(deployStyle).toBe(runtimeStyle);
  });

  it('does not force the game container into a desktop-centered 100vh strip', () => {
    expect(deployStyle).toContain('touch-action: none');
    expect(deployStyle).toContain('height: 100%');
    expect(deployStyle).not.toContain('height: 100vh');
  });
});
