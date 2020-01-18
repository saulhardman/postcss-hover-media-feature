import json from '@rollup/plugin-json'
import babel from 'rollup-plugin-babel'

import babelConfig from './babel.config.json'

export default {
  input: 'index.js',
  external: ['postcss'],

  output: [
    { file: 'index.cjs.js', format: 'cjs', sourcemap: true },
    { file: 'index.es.mjs', format: 'es', sourcemap: true }
  ],

  plugins: [
    json(),
    babel(babelConfig)
  ]
}
