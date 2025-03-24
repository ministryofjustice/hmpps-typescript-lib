/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dts } from 'rollup-plugin-dts'
import copy from 'rollup-plugin-copy'
import pkg from './package.json'
/* eslint-enable import/no-extraneous-dependencies */

const outputDir = path.resolve(__dirname, '../../dist', pkg.name)

export default [
  {
    input: 'src/main/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'esm', sourcemap: true },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({
        tsconfig: './tsconfig.json',
        noEmitOnError: true,
      }),
      copy({
        targets: [
          {
            src: 'package.json',
            dest: outputDir,
            transform: () => {
              return JSON.stringify(
                {
                  ...pkg,
                  name: `@ministryofjustice/${pkg.name}`,
                  devDependencies: {},
                },
                null,
                2,
              )
            },
          },
          { src: '*.md', dest: outputDir },
          { src: 'dist', dest: outputDir },
        ],
      }),
    ],
  },
  {
    input: 'dist/main/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [nodeResolve({ preferBuiltins: true }), dts()],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
]
