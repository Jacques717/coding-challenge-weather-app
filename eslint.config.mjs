import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default createConfigForNuxt({
  features: {
    stylistic: {
      braceStyle: '1tbs',
      commaDangle: 'never'
    }
  },
  ignores: [
    '**/dist',
    '**/dev-dist',
    '**/.nuxt',
    '**/coverage',
    '**/node_modules'
  ],
  files: [
    '**/*.{js,mjs,cjs,ts,vue}'
  ]
}).override('nuxt/stylistic', {
  rules: {
    '@stylistic/indent': [ 'error', 2, { SwitchCase: 0 }],
    '@stylistic/space-before-function-paren': [ 'error', 'always' ],
    '@stylistic/array-bracket-spacing': [ 'error', 'always', {
      objectsInArrays: false,
      arraysInArrays: false
    }]
  }
}).override('nuxt/typescript/rules', {
  rules: {
    '@typescript-eslint/no-unused-vars': isDevelopment ? 'off' : 'error',
    '@typescript-eslint/no-console': isDevelopment ? 'off' : 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'warn'
  }
}).override('nuxt/vue/rules', {
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-v-html': 'off',
    'vue/no-side-effects-in-computed-properties': 'warn'
  }
})
