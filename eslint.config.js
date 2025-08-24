import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      '.vercel/**',
      'node_modules/**',
      'api/**',
      '*.config.js',
      '*.config.cjs',
      'server.js',
      'callback-server.js'
    ]
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Relax rules for development and deployment
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern:
            '^(React|_|Icon|Link|Routes|Route|useEffect|useState|useMemo|useCallback)',
          argsIgnorePattern: '^(_|e|event|index|error|loading|data)'
        }
      ],
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'warn',
      'no-case-declarations': 'warn',
      'no-unsafe-optional-chaining': 'warn',

      // React specific - relaxed for deployment
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]
