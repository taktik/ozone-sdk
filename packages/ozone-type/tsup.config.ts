import { defineConfig } from 'tsup'

export default defineConfig({
	entry: { index: 'ozone/index.ts' },
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	target: 'es2018'
})
