import { defineConfig } from 'tsup'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		search: 'src/search/index.ts',
		urls: 'src/urls/index.ts',
		default: 'src/default/index.ts',
		upload: 'src/upload/index.ts'
	},
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	target: 'es2018'
})
