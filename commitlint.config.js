module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'test',
        'refactor',
        'perf',
        'build',
        'ci',
        'chore'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'repo',
        'api',
        'mobile',
        'domain',
        'db',
        'persistence',
        'application',
        'ingestion',
        'scheduler',
        'observability',
        'security',
        'docker',
        'config',
        'adr',
        'e2e',
        'qa',
        'deploy',
        'readme',
        'release'
      ]
    ]
  }
};

