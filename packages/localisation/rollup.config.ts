// eslint-disable-next-line import/no-extraneous-dependencies
import typescript from '@rollup/plugin-typescript'
// eslint-disable-next-line import/no-extraneous-dependencies
import { dts } from 'rollup-plugin-dts'

import pkg from './package.json'

export default [
  {
    input: 'src/main/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'esm', sourcemap: true },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
  {
    input: 'dist/main/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
]
