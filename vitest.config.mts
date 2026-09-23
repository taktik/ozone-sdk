import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	/*
		ozone-client depends on ozone-type, whose package.json points at dist. Left
		alone, the suite only runs once ozone-type has been built, which makes a
		fresh clone fail in a way that has nothing to do with the tests. The alias
		points at the source, the way the client's tsconfig paths does.
	*/
	resolve: {
		alias: {
			'@taktik/ozone-type': fileURLToPath(
				new URL('./packages/ozone-type/ozone/index.ts', import.meta.url),
			),
		},
	},
	esbuild: {
		/*
			esbuild does not pick up experimentalDecorators from the package
			tsconfigs on its own, and without it the decorated methods of
			OzoneClientImpl -- @AssumeStateIs and friends -- fail to parse, which
			surfaces as a bare "SyntaxError: Invalid or unexpected token" with no
			file or line.

			useDefineForClassFields stays off to match what tsc does for these
			targets: the @OzoneType decorator returns a subclass that assigns
			`type` as a plain property, and define semantics would shadow it.
		*/
		tsconfigRaw: {
			compilerOptions: {
				experimentalDecorators: true,
				useDefineForClassFields: false,
			},
		},
	},
	test: {
		/*
			sinon.fakeServer swaps the global XMLHttpRequest, so the tests need one
			to exist. That is the only reason the old Karma setup ran a real Chrome:
			the client is never started here, so window and WebSocket are never hit.
		*/
		environment: 'jsdom',
		globals: true,
		include: ['packages/*/test/**/*.spec.ts'],
	},
})
