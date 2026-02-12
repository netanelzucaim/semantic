module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scope is optional, but if provided, must match plugin names or infrastructure scopes
    'scope-enum': [2, 'always', ['netanel', 'lagziel', 'workflow', 'config', 'ci']],
    'scope-empty': [0, 'never'], // Allow empty scope (0 = disabled)
  },
};
