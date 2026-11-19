// Vice Sunset Split — main.ts
// Entry program for make.fun's gta6-cover-art-01 ("Make GTA 6 Cover Art").
// Copies app/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from vendor/makefun-app.ts.
// Deterministic: the same repository always writes the same bytes.
// Run outside the grader with MAKEFUN_OUTPUT_DIR set to a local directory;
// inside the grader /output is used. Node 22, standard library only.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const appSource = join(repoRoot, 'app');
const shotsSource = join(repoRoot, 'screenshots');

if (!existsSync(appSource)) throw new Error(`main.ts: app/ not found in ${repoRoot}`);
if (!existsSync(shotsSource)) throw new Error(`main.ts: screenshots/ not found in ${repoRoot}`);

// Start from a clean output directory so a stale file can never leak in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(appSource, join(outputDir, 'app'), { recursive: true });
cpSync(shotsSource, join(outputDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
