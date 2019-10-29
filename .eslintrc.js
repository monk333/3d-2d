module.exports = {
  extends: 'airbnb-base',
  plugins: [
    'html',
  ],
  env: {
    browser: true,
    jest: true,
  },
  rules: {
    'class-methods-use-this': 0,
    'func-names': 0,
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'max-len': 0,
    'no-bitwise': 0,
    'no-console': 0,
    'no-lonely-if': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-multi-assign': 0,
    'no-nested-ternary': 0,
    'no-this-before-super': 0,
    'no-underscore-dangle': 0,
    'no-unused-vars': ['error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': false }],
    'one-var': 0,
    'prefer-const': 0,
    'prefer-destructuring': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: [
          'node_modules',
          'docs/libs/vendor',
        ],
      },
    },
  },
};
