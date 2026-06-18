module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      ['api', 'web', 'contracts', 'docs', 'ci', 'deps', 'repo'],
    ],
  },
}
