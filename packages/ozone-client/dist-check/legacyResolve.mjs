/*
	Asserts the published entry points are reachable by resolvers that ignore the `exports`
	map: webpack 4 / enhanced-resolve 4, and TypeScript's node10 resolution. Those consumers
	reach a subpath through its <subpath>/package.json shim instead.

	The sibling tsc gate cannot see this. It resolves types through `typesVersions`, which
	node10 honours, so the shims stay unexercised and a stale one -- a renamed dist file, a
	`files` entry left behind -- would only surface as a broken bundle in a consumer.
*/
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const manifest = readJson(resolve(packageRoot, 'package.json'))
const subpaths = Object.keys(manifest.exports).filter((name) => name !== '.')

const failures = []
const expect = (condition, message) => {
	if (!condition) failures.push(message)
}
const expectFile = (path, what) => expect(existsSync(path), `${what} does not exist: ${path}`)

expectFile(resolve(packageRoot, manifest.main), 'root "main"')
expectFile(resolve(packageRoot, manifest.types), 'root "types"')

for (const subpath of subpaths) {
	const name = subpath.replace('./', '')
	const shim = resolve(packageRoot, name, 'package.json')

	expect(manifest.files.includes(name), `"files" does not publish the ${name} shim`)
	if (!existsSync(shim)) {
		failures.push(`${name} has no package.json shim, so only "exports" can reach it`)
		continue
	}

	const { main, types } = readJson(shim)
	expectFile(resolve(packageRoot, name, main), `${name} shim "main"`)
	expectFile(resolve(packageRoot, name, types), `${name} shim "types"`)
}

if (failures.length > 0) {
	console.error(`Legacy resolution is broken for @taktik/ozone-client:\n  ${failures.join('\n  ')}`)
	process.exit(1)
}
