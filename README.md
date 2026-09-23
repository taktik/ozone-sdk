# ozone-sdk

Le kit TypeScript pour parler à Ozone. Deux packages publiés :

| Package | Rôle |
|---|---|
| `@taktik/ozone-type` | Les types du contrat Ozone, générés depuis le swagger du serveur |
| `@taktik/ozone-client` | Le client HTTP/WebSocket, la construction de requêtes de recherche, les URL de médias et l'upload |

Ils remplacent six packages de [`ozone-components`](https://github.com/taktik/ozone-components), qui reste en
maintenance pour les composants Polymer uniquement.

## Correspondance avec les anciens packages

| Avant | Maintenant |
|---|---|
| `ozone-type` | `@taktik/ozone-type` |
| `ozone-typescript-client` | `@taktik/ozone-client` |
| `ozone-search-helper` | `@taktik/ozone-client/search` |
| `ozone-media-url` | `@taktik/ozone-client/urls` |
| `ozone-default-client` | `@taktik/ozone-client/default` |
| `ozone-api-upload-v3` | `@taktik/ozone-client/upload` |

Les anciens packages restent disponibles sur npmjs à leur dernière version, mais ne sont plus publiés.

## Développer

```bash
nvm use          # Node 22
yarn install
yarn build
yarn test
```

Les packages sont liés entre eux par les workspaces yarn : `@taktik/ozone-client` consomme le
`@taktik/ozone-type` local, pas celui du registry.

## Publier

Rien ne se publie depuis un poste de dev. Le build tourne sur taktik.ci
([`ci/cloudbuild.yaml`](ci/cloudbuild.yaml)) et pousse sur `npm.taktik.be`.

Les versions sont calculées par `git-version`, par chemin : un package dont le code n'a pas changé
n'est pas republié.

## Régénérer les types

`@taktik/ozone-type` est généré depuis le swagger d'un serveur Ozone. Le `swagger.json` est versionné
pour que la génération soit reproductible et que les diffs soient lisibles.

```bash
OZONE_PASSWORD=... ./scripts/generate-types.sh https://test.flowr.cloud/ozone
```
