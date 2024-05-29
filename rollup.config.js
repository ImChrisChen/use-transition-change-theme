import vue from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      commonjs(),
      vue({
        css: true,
        template: {
          isProduction: true,
        },
      }),
      typescript({
        tsconfig: 'tsconfig.json',
      }),
    ],
    external: ['vue'],
  },
];
