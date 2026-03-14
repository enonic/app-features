import type { Options } from './tsup';


import { defineConfig } from 'tsup';
import { DIR_DST } from './tsup/constants';


export default defineConfig(async (options: Options) => {
  if (options.d === DIR_DST) {
    return import('./tsup/server').then(m => m.default());
  }
  throw new Error(`Unconfigured directory:${options.d}!`);
});
