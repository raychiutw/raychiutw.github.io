import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '../..');

function activeRepositoryMatches(pattern: string) {
  const result = spawnSync(
    'git',
    [
      'grep',
      '-IinE',
      '-e',
      pattern,
      '--',
      '.',
      ':!CHANGELOG.md',
      ':!src/content/blog/**',
      ':!src/__tests__/repository-retirement.test.ts',
    ],
    { cwd: REPO_ROOT, encoding: 'utf8' },
  );

  if (result.status === 1) return [];
  if (result.status !== 0) {
    throw new Error(result.stderr || `git grep failed with status ${result.status}`);
  }

  return result.stdout.trim().split(/\r?\n/).filter(Boolean);
}

describe('retired specification frameworks stay out of the repository', () => {
  it('has no active OpenSpec artifacts or references', () => {
    const matches = activeRepositoryMatches('openspec|opsx');

    expect({
      exists: existsSync(resolve(REPO_ROOT, 'openspec')),
      count: matches.length,
      sample: matches.slice(0, 20),
    }).toEqual({
      exists: false,
      count: 0,
      sample: [],
    });
  });
});
