import json from 'rollup-plugin-json';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/dist.js',
    format: 'es',
  },
  external: [
    'gl-matrix',
  ],
  plugins: [
    json(),
  ],
};
