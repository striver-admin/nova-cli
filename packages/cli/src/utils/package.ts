import fs from 'fs-extra';
import { join } from 'path';

interface PackageJsonUpdate {
  name?: string;
  version?: string;
  [key: string]: any;
}

export async function updatePackageJson(dir: string, updates: PackageJsonUpdate) {
  const packagePath = join(dir, 'package.json');
  const pkg = await fs.readJson(packagePath);

  Object.assign(pkg, updates);

  // Remove nova-cli specific fields that shouldn't leak into projects
  delete pkg.devDependencies?.tsup;
  delete pkg.scripts?.build;

  await fs.writeJson(packagePath, pkg, { spaces: 2 });
}
