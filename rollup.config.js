import strip from '@rollup/plugin-strip'
import css from 'rollup-plugin-import-css'
import metadata from 'rollup-plugin-userscript-metadata'

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'index.user.js',
      format: 'cjs',
    },
  ],
  plugins: [
    metadata({
      metadata: 'src/metadata.json',
    }),
    css(),
    strip({
      functions: process.env.BUILD === 'production' ? ['console.log'] : [],
    }),
  ],
}
