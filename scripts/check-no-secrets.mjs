import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const MAX_TEXT_FILE_BYTES = 5 * 1024 * 1024;
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  'coverage',
  '.vercel',
]);
const ALLOWED_ENV_FILES = new Set(['.env.example']);
const SECRET_PATTERNS = [
  {
    id: 'openai-api-key',
    regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'private-key-block',
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: 'hardcoded-wallet-secret-assignment',
    regex: /\b(?:MNEMONIC|WALLET_MNEMONIC|NIMIQ_MNEMONIC|PRIVATE_KEY|NIMIQ_PRIVATE_KEY)\s*[:=]\s*["'][^"']{12,}["']/gi,
  },
];

function normalizeRelativePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function runGitLsFiles() {
  const output = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: REPO_ROOT }
  );

  return output
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((filePath) => path.resolve(REPO_ROOT, filePath));
}

function findForbiddenEnvFiles(dir = REPO_ROOT, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        findForbiddenEnvFiles(path.join(dir, entry.name), results);
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.startsWith('.env') && !ALLOWED_ENV_FILES.has(entry.name)) {
      results.push(path.join(dir, entry.name));
    }
  }

  return results;
}

function isLikelyText(buffer) {
  return !buffer.includes(0);
}

function redact(value) {
  if (value.length <= 12) {
    return '[redacted]';
  }

  return `${value.slice(0, 4)}...[redacted]...${value.slice(-4)}`;
}

function scanFile(filePath) {
  const stat = statSync(filePath);

  if (!stat.isFile() || stat.size > MAX_TEXT_FILE_BYTES) {
    return [];
  }

  const buffer = readFileSync(filePath);

  if (!isLikelyText(buffer)) {
    return [];
  }

  const text = buffer.toString('utf8');
  const findings = [];

  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;

    for (const match of text.matchAll(pattern.regex)) {
      const line = text.slice(0, match.index).split(/\r?\n/).length;
      findings.push({
        id: pattern.id,
        filePath,
        line,
        match: redact(match[0]),
      });
    }
  }

  return findings;
}

const forbiddenEnvFiles = findForbiddenEnvFiles();
const trackedAndVisibleFiles = runGitLsFiles().filter((filePath) => existsSync(filePath));
const findings = trackedAndVisibleFiles.flatMap(scanFile);

if (forbiddenEnvFiles.length > 0 || findings.length > 0) {
  console.error('No-secrets check failed.');

  for (const filePath of forbiddenEnvFiles) {
    console.error(
      `Forbidden env file: ${normalizeRelativePath(path.relative(REPO_ROOT, filePath))}`
    );
  }

  for (const finding of findings) {
    console.error(
      `${finding.id}: ${normalizeRelativePath(path.relative(REPO_ROOT, finding.filePath))}:${finding.line} ${finding.match}`
    );
  }

  process.exit(1);
}

console.log('No repository secrets found.');
console.log(`Scanned ${trackedAndVisibleFiles.length} tracked/unignored files.`);
console.log('Checked forbidden env files and high-confidence secret patterns.');
