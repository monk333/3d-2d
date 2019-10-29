import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'util/bundle.js',
  output: {
    file: 'docs/libs/bundle.js',
    format: 'es',
  },
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectory: [
          'docs/libs/vendor',
          'node_modules',
        ],
      },
    }),
    terser({
      compress: {
        global_defs: {
          DEBUG: false,
        },
      },
    }),
  ],
};
