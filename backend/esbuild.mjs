import glob from 'glob';
import { build } from 'esbuild';
import { rimraf } from 'rimraf';
import { statSync } from 'fs';

// clear dist
await rimraf('dist');

// build
await build({
  entryPoints: glob.sync('src/resolvers/*'),
  entryNames: '[dir]/[name]/index',
  bundle: true,
  // easier to debug, should be enabled in prod once local testing is in place
  minify: false,
  treeShaking: true,
  sourcemap: true,
  platform: 'node',
  target: 'node18',
  outdir: 'dist',
  outbase: 'src'
});

// log bundle sizes
console.info('Bundle sizes:')
glob.sync('dist/**/index.js').forEach(bundle => {
  const { size } = statSync(bundle);
  console.info(`  ${bundle}:\t${size / 1024} KB`);
});
