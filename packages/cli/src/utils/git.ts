import { execa } from 'execa';
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs-extra';
import { templates } from '../templates/registry.js';

export async function cloneTemplate(templateName: string, targetDir: string) {
  const template = templates.find(t => t.name === templateName);
  if (!template) {
    throw new Error(`Template "${templateName}" not found. Run "nova list" to see available templates.`);
  }

  const tmpDir = join(tmpdir(), `nova-cli-${Date.now()}`);

  try {
    await execa('git', [
      'clone',
      '--depth', '1',
      '--branch', template.branch,
      template.repo,
      tmpDir
    ]);

    const sourceDir = join(tmpDir, template.dir);
    await fs.copy(sourceDir, targetDir);
  } finally {
    await fs.remove(tmpDir);
  }
}

export async function initGit(dir: string) {
  await execa('git', ['init'], { cwd: dir });
  await execa('git', ['add', '.'], { cwd: dir });
  await execa('git', ['commit', '-m', 'Initial commit from nova-cli'], { cwd: dir });
}
