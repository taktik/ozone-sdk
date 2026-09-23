# @taktik/ozone-type

The Ozone API types for TypeScript: the REST contract, the item types, and the helpers needed to send
an item back.

## Install

```
yarn add @taktik/ozone-type
```

The `@taktik` scope is served by the Taktik registry, so it has to be routed — in your `.npmrc`:

```
@taktik:registry=https://npm.taktik.be/repository/npm/
```

## Usage

Everything Ozone stores extends `Item` and carries a `type` discriminator:

```typescript
import { Article, FromOzone, Patch, UUID } from '@taktik/ozone-type'
```

Two type helpers describe the two directions of travel:

- **`FromOzone<T>`** — what the server sends back: same as `T`, but `id`, `version`, `tenant`, `type`
  and `_meta` are guaranteed present rather than optional.
- **`Patch<T>`** — what you may send: every field optional and nullable (`null` erases it on Ozone),
  except `id`, `version` and `type`.

And two functions to go from one to the other:

```typescript
import { toPatch } from '@taktik/ozone-type'

const article = await client.itemClient<Article>('article').findOne(id)   // FromOzone<Article> | null
if (!article) return

const patch = toPatch(article)      // undefined fields are dropped: Ozone leaves them untouched
patch.localizedName = { fr: 'bonjour', en: 'hello' }
await client.itemClient<Article>('article').save(patch)
```

`toPatchWithUndefinedAsNull` differs on one point: it turns `undefined` into `null`, so those fields
are **erased** on Ozone instead of being left alone. Reach for it when clearing is what you mean.

## Declaring your own type

```typescript
import { OzoneType, Item, UUID } from '@taktik/ozone-type'

@OzoneType('my.new.type')
export class MyNewType extends Item {
	anAttribute?: UUID
}
```

The `@` is not optional: without it, `OzoneType(...)` is a plain call that does nothing and the class
never gets its `type`.

---

Most of this package is generated from a running Ozone server — see the
[repository README](../../README.md) if you need to regenerate it.
