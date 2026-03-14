import type { Options } from '.';


import { globSync } from 'glob';
import {
  AND_BELOW,
  DIR_SRC,
  DIR_SRC_ASSETS,
} from './constants';
import { dict } from './dict';


export default function buildServerConfig(): Options {

  const GLOB_EXTENSIONS_SERVER = 'ts';
  const GLOB_CONFIG = {
    absolute: false,
    posix: true
  }

  const FILES_SERVER = globSync(
    `${DIR_SRC}/${AND_BELOW}/*.${GLOB_EXTENSIONS_SERVER}`,
    {
      ...GLOB_CONFIG,
      ignore: globSync(
        `${DIR_SRC_ASSETS}/${AND_BELOW}/*.${GLOB_EXTENSIONS_SERVER}`,
        GLOB_CONFIG
      )
    }
  );

  const SERVER_JS_ENTRY = dict(FILES_SERVER.map(k => [
		k.replace(`${DIR_SRC}/`, '').replace(/\.[^.]*$/, ''), // name
    k
	]));

  return {
    bundle: true,
    dts: false, // d.ts files are use useless at runtime
    entry: SERVER_JS_ENTRY,
    env: {
      BROWSER_SYNC_PORT: '3100',
    },
    esbuildOptions(options, context) {
      // If you have libs with chunks, use this to avoid collisions
      options.chunkNames = '_chunks/[name]-[hash]';

      options.mainFields = ['module', 'main'];
    },

    external: [
      '/lib/cache',
      '/lib/enonic/static',
      /^\/lib\/guillotine/,
      '/lib/graphql',
      '/lib/graphql-connection',
      '/lib/http-client',
      '/lib/license',
      '/lib/mustache',
      '/lib/router',
      '/lib/util',
      '/lib/vanilla',
      '/lib/text-encoding',
      '/lib/thymeleaf',
      /^\/lib\/xp\//,
    ],
    format: 'cjs',
    minify: false, // Minifying server files makes debugging harder
    // noExternal: [],
    platform: 'neutral',

    silent: ['QUIET', 'WARN']
      .includes(process.env.LOG_LEVEL_FROM_GRADLE || ''),

    shims: false,
    splitting: true,
    sourcemap: false,
    target: 'es5',
    tsconfig: `${DIR_SRC}/tsconfig.json`,
  };
}
