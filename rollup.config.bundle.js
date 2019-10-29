import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
  input: './src/util/bundle-dwg.js',
  output: [{
    file: 'docs/libs/bimv.dwg.js',
    format: 'es',
  }, {
    file: 'docs/libs/bimv.dwg.iife.js',
    name: 'bimv.dwg',
    format: 'iife',
  }],
  external: [
    'gl-matrix',
    'three',
  ],
  plugins: [
    json(),
    resolve({
      customResolveOptions: {
        moduleDirectory: [
          'docs/libs/vendor',
          'node_modules',
        ],
      },
    }),
  ],
};
