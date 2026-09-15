'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var typescript = require('@rollup/plugin-typescript');
var pluginNodeResolve = require('@rollup/plugin-node-resolve');
var rollupPluginDts = require('rollup-plugin-dts');
var pkg = require('./package.json');

/* eslint-disable import/no-extraneous-dependencies */

var rollup_config = [
  {
    input: 'src/main/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'esm', sourcemap: true },
    ],
    plugins: [pluginNodeResolve.nodeResolve({ preferBuiltins: true }), typescript({ tsconfig: './tsconfig.json', noEmitOnError: true })],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
  {
    input: 'dist/main/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [pluginNodeResolve.nodeResolve({ preferBuiltins: true }), rollupPluginDts.dts()],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  },
];

exports.default = rollup_config;
