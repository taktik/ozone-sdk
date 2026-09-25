import { defineConfig } from 'tsup'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		search: 'src/search/index.ts',
		urls: 'src/urls/index.ts',
		default: 'src/default/index.ts',
		upload: 'src/upload/index.ts',
	},
	format: ['esm', 'cjs'],
	// Types come from `tsc -p tsconfig.build.json`; that file says why.
	dts: false,
	sourcemap: true,
	clean: true,
	target: 'es2018',
})
