# ozone-sdk

The TypeScript SDK for Ozone. Two published packages:

| Package | What it holds |
|---|---|
| `@taktik/ozone-type` | The Ozone API types, generated from the server swagger |
| `@taktik/ozone-client` | The HTTP/WebSocket client, the search query builder, media URLs and upload |

They replace six packages of [`ozone-components`](https://github.com/taktik/ozone-components), which stays
in maintenance for the Polymer components only.

## Moving from the old packages

| Before | Now |
|---|---|
| `ozone-type` | `@taktik/ozone-type` |
| `ozone-typescript-client` | `@taktik/ozone-client` |
| `ozone-search-helper` | `@taktik/ozone-client/search` |
| `ozone-media-url` | `@taktik/ozone-client/urls` |
| `ozone-default-client` | `@taktik/ozone-client/default` |
| `ozone-api-upload-v3` | `@taktik/ozone-client/upload` |

The old packages stay on npmjs at their last version, but are no longer published.

## Installing

The `@taktik` scope is served by the Taktik registry, so consumers need it routed:

```
@taktik:registry=https://npm.taktik.be/repository/npm/
```

## Developing

```bash
nvm use          # Node 22
yarn install
yarn build
yarn test
```

The packages are linked through yarn workspaces: `@taktik/ozone-client` builds against the local
`@taktik/ozone-type`, not the published one.

## Releasing

Nothing is published from a developer machine. The build runs on taktik.ci
([`ci/cloudbuild.yaml`](ci/cloudbuild.yaml)) and pushes to `npm.taktik.be`.

Versions are computed by `git-version` per path, so a package whose code has not changed is not
republished.

## Regenerating the types

`@taktik/ozone-type` is generated from a running Ozone server, not written by hand — see its own
[README](packages/ozone-type/README.md). That generation is not wired into this repo yet; the types
were imported at the last released state of `ozone-components` and are edited by hand until it is.
