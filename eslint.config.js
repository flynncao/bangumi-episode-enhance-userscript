import { sxzz } from '@sxzz/eslint-config'

export default sxzz(
  {
    prettier: true,
    markdown: true,
    vue: false, // auto detection
    unocss: false, // auto detection
  },
  [
    {
      rules: {
        'require-await': 'off',
        'no-undef': 'off',
        'no-console': 'off',
        'node/prefer-global/process': 'off',
        'regexp/no-unused-capturing-group': 'warn',
        'unused-imports/no-unused-imports': 'warn',
        'unused-imports/no-unused-vars': 'warn',
        'unicorn/no-static-only-class': 'warn',
        'unicorn/prefer-array-some': 'off',
        'vars-on-top': 'off',
      },
    },
  ],
)
