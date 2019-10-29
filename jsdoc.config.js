module.exports = {
  source: {
    include: [
      'src/',
    ],
  },
  templates: {
    default: {
      includeDate: false,
      outputSourceFiles: false,
    },
  },
  opts: {
    destination: 'docs/jsdoc/',
    recurse: true,
  },
};
