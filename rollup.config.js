import strip from '@rollup/plugin-strip'
import typescript from '@rollup/plugin-typescript'
import { createGenerator } from '@unocss/core'
import css from 'rollup-plugin-import-css'
import metadata from 'rollup-plugin-userscript-metadata'

import unoConfig, { unoIconClasses } from './uno.config.js'

const UNO_CSS_MODULE_ID = 'virtual:uno.css'
const RESOLVED_UNO_CSS_MODULE_ID = `\0${UNO_CSS_MODULE_ID}`

function unoCssString() {
  return {
    name: 'unocss-icons-as-string',
    resolveId(source) {
      return source === UNO_CSS_MODULE_ID ? RESOLVED_UNO_CSS_MODULE_ID : null
    },
    async load(id) {
      if (id !== RESOLVED_UNO_CSS_MODULE_ID) {
        return null
      }

      const generator = await createGenerator(unoConfig)
      const { css: generatedCss, matched } = await generator.generate('', {
        preflights: false,
        safelist: true,
      })
      const missingIcons = unoIconClasses.filter(iconClass => !matched.has(iconClass))

      if (missingIcons.length > 0) {
        this.error(`[UnoCSS] Missing icons: ${missingIcons.join(', ')}`)
      }

      const minifiedCss = generatedCss
        .replace('/* layer: icons */\n', '')
        .replaceAll('\n', '')

      return `export default ${JSON.stringify(minifiedCss)}`
    },
  }
}

export default {
  input: 'src/main.ts',
  external: ['$', 'chiiLib'],
  output: [
    {
      file: 'dist/index.user.js',
      format: 'cjs',
      globals: {
        chiiApp: 'chiiApp',
        chiiLib: 'chiiLib',
      },
    },
  ],
  plugins: [
    metadata({
      metadata: 'src/metadata.json',
    }),
    unoCssString(),
    css(),
    // typescript({
    //   tsconfig: './tsconfig.json',
    // }),
    typescript(),
    strip({
      functions: process.env.BUILD === 'production' ? ['console.log'] : [],
    }),
  ],
}
