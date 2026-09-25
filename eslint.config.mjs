import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

/*
	Same rules as taktik-flowr-react-utils, minus the React half. Expressed as a
	flat config because ESLint 10 no longer reads .eslintrc.

	On the rules that are errors there versus warnings here: this code was
	imported, not written against the config, and a gate that starts red is a
	gate nobody can pass. What stays an error is what catches a bug. What is a
	warning is a pattern the code uses deliberately or everywhere, listed below
	with the reason -- and warnings are not free either, since lint-staged runs
	with --max-warnings 0, so anything you touch has to come out clean.
*/
export default tseslint.config(
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			/*
				ozone/model is generated -- ~480 files by swagger-codegen, ~155 by the
				oz CLI. Linting it would mean either a permanently red report or fixes
				that the next regeneration undoes.
			*/
			'packages/ozone-type/ozone/model/**',
		],
	},

	js.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,

	{
		languageOptions: {
			parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
		},
		linterOptions: { reportUnusedDisableDirectives: true },
		rules: {
			'no-var': 'error',
			'no-console': ['warn', { allow: ['warn', 'error', 'time', 'timeEnd'] }],
			'no-duplicate-imports': 'warn',
			eqeqeq: 'error',
			'prefer-const': 'warn',

			'@typescript-eslint/no-shadow': 'warn',
			'@typescript-eslint/no-useless-constructor': 'warn',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'warn',

			'no-shadow': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',

			// Ozone hands back dynamically typed items, so `any` is how the client
			// describes what it genuinely does not know. Narrowing it is a project
			// of its own.
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-call': 'warn',
			'@typescript-eslint/no-unsafe-return': 'warn',

			// Ozone answers 200 with the failure in the body, so the client throws
			// and rejects with the item itself rather than an Error. Consumers
			// depend on reading it, and the tests pin it.
			'@typescript-eslint/only-throw-error': 'warn',
			'@typescript-eslint/prefer-promise-reject-errors': 'warn',

			// the public API is the OzoneClient namespace; changing that is a
			// breaking change, not a lint fix
			'@typescript-eslint/no-namespace': 'off',

			'@typescript-eslint/require-await': 'warn',
			'@typescript-eslint/no-misused-promises': 'warn',
			'@typescript-eslint/no-this-alias': 'warn',
			'@typescript-eslint/restrict-plus-operands': 'warn',
			'@typescript-eslint/unbound-method': 'warn',
			'no-useless-catch': 'warn',
			'preserve-caught-error': 'warn',

			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
			],
		},
	},

	{
		/*
			Build-time scripts, run by node straight from source and deliberately outside any
			tsconfig -- so the type-aware rules have no program to read, and the parser reports the
			file as missing from the project. Every rule that does not need types still applies.
		*/
		files: ['packages/*/dist-check/**/*.mjs'],
		...tseslint.configs.disableTypeChecked,
		languageOptions: {
			parserOptions: { projectService: false },
			globals: { console: 'readonly', process: 'readonly' },
		},
	},

	{
		files: ['packages/*/test/**/*.ts'],
		rules: {
			/*
				chai's fluent API is untyped by design: expect(x).to.deep.equal(y) is a
				chain of any, and sinon stubs are any too. The type-unsafe family flags
				every assertion in the suite, which says nothing about the code under
				test. Same for values a test awaits to prove a call resolves without
				asserting on the result.
			*/
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},

	// prettier last: it owns formatting, ESLint stays on correctness
	prettier,
)
