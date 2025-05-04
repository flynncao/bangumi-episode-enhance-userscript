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
        'regexp/no-unused-capturing-group': 'off',
        'no-unused-expressions': 'off',
        'unused-imports/no-unused-imports': 'off',
        'unused-imports/no-unused-vars': 'off',
        'unicorn/no-static-only-class': 'off',
        'unicorn/prefer-array-some': 'off',
      },
    },
  ],
)
