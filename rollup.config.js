import strip from '@rollup/plugin-strip'
import typescript from '@rollup/plugin-typescript'
import css from 'rollup-plugin-import-css'
import metadata from 'rollup-plugin-userscript-metadata'

export default {
  input: 'src/main.ts',
  output: [
    {
      file: 'dist/index.user.js',
      format: 'cjs',
    },
  ],
  plugins: [
    metadata({
      metadata: 'src/metadata.json',
    }),
    css(),
    typescript(),
    strip({
      functions: process.env.BUILD === 'production' ? ['console.log'] : [],
    }),
  ],
}
