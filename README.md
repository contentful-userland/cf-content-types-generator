# cf-content-types-generator

Generate TypeScript types from your Contentful content model, either from a local `contentful space export` JSON file or by fetching the model directly from Contentful.

Use the generated types with `contentful.js` v10+ for safer queries, autocomplete, and less schema drift between Contentful and your app.

> As of v3.x, pre-v10 output is removed. If you are upgrading from `2.x`, modern `contentful.js` typing is now the default and only output model.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cf-content-types-generator.svg)](https://npmjs.org/package/cf-content-types-generator)
[![Downloads/week](https://img.shields.io/npm/dw/cf-content-types-generator.svg)](https://npmjs.org/package/cf-content-types-generator)
[![License](https://img.shields.io/npm/l/cf-content-types-generator.svg)](https://github.com/contentful-userland/cf-content-types-generator/blob/master/package.json)
[![Coverage Status](https://coveralls.io/repos/github/contentful-userland/cf-content-types-generator/badge.svg)](https://coveralls.io/github/contentful-userland/cf-content-types-generator)

```ts
import type { TypeAnimal } from './@types/generated';
```

## Install

```bash
npm install --save-dev cf-content-types-generator
```

## Quickstart In 60 Seconds

You can generate types in two ways:

- from a local export JSON file in the exact [Input](#input) shape, usually created with `contentful space export`
- by providing Contentful credentials and letting the CLI fetch the same model data on the fly

### Path A: Generate From A Local Export JSON File

Export your space model:

```bash
contentful space export --config ./export-config.json
```

Generate types:

```bash
cf-content-types-generator ./contentful-export.json -o src/@types/generated
```

Use the generated type:

```ts
import type { TypeAnimal } from './@types/generated';
```

### Path B: Generate By Fetching From Contentful

```bash
cf-content-types-generator \
  -s <space-id> \
  -t <management-token> \
  -e <environment> \
  --proxy https://user:password@proxy.example:8443 \
  -o src/@types/generated
```

If your network requires a proxy, you can also add `--rawProxy` to pass the proxy config straight to Axios.

## What It’s For

- turn a Contentful content model into generated TypeScript types
- use those generated types in apps built with `contentful.js` v10+
- optionally add JSDoc, type guards, and response aliases

### When To Use It

- you keep Contentful schema in source control and want generated app types
- you use `contentful.js` in TypeScript and want typed entries based on your real model
- you want type generation in CI from either exports or live space data

Further reading: if you want broader context on typing Contentful projects with TypeScript, see Contentful’s guide to [TypeScript and Contentful](https://www.contentful.com/blog/contentful-typescript/).

## CLI Usage

```text
cf-content-types-generator [FILE]
```

Common tasks:

- generate from a local export JSON file: `cf-content-types-generator ./contentful-export.json -o src/@types/generated`
- generate by fetching live data: `cf-content-types-generator -s <space-id> -t <management-token> -e <environment> -o src/@types/generated`
- add optional helpers: `cf-content-types-generator ./contentful-export.json -o src/@types/generated --jsdoc --typeguard --response`

Key flags:

- `-o, --out` output directory
- `-p, --preserve` preserve existing output folder
- `-d, --jsdoc` add JSDoc comments
- `-g, --typeguard` add modern type guards
- `-r, --response` add response aliases
- `-s, --spaceId` Contentful space id
- `-t, --token` Contentful management token
- `-e, --environment` Contentful environment
- `-a, --host` Management API host
- `--proxy` proxy URL in HTTP auth format
- `--rawProxy` pass proxy config to Axios directly

Removed in v3.x:

- `--v10`
- `--localized`

Both now error with explicit migration hints.

## Optional Renderers

All examples below use the same generated base type:

```ts
export interface TypeAnimalFields {
  breed?: EntryFieldTypes.Symbol;
}

export type TypeAnimalSkeleton = EntrySkeletonType<TypeAnimalFields, 'animal'>;
export type TypeAnimal<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeAnimalSkeleton, Modifiers, Locales>;
```

### `-d, --jsdoc`

Adds generated comments to fields, skeletons, and entries.

```diff
 /**
  * Fields type definition for content type 'TypeAnimal'
  * @name TypeAnimalFields
  * @type {TypeAnimalFields}
  * @memberof TypeAnimal
  */
 export interface TypeAnimalFields {
   /**
    * Field type definition for field 'breed' (Breed)
    * @name Breed
    * @localized false
    */
   breed?: EntryFieldTypes.Symbol;
 }
```

### `-g, --typeguard`

Adds a runtime predicate for the generated entry type.

```ts
export function isTypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>,
): entry is TypeAnimal<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'animal';
}
```

### `-r, --response`

Adds aliases for common response modifier combinations.

```ts
export type TypeAnimalWithoutLinkResolutionResponse = TypeAnimal<'WITHOUT_LINK_RESOLUTION'>;
export type TypeAnimalWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeAnimal<
  'WITH_ALL_LOCALES',
  Locales
>;
```

### `-m, --modifiers`

Adds default modifiers to resolved types. Multiple modifiers are allows and will be unionized. Valid options are `WITH_ALL_LOCALES`, `WITHOUT_LINK_RESOLUTION`, `WITHOUT_UNRESOLVABLE_LINKS`, `WITH_LOCALE_BASED_PUBLISHING`, `undefined`.

```
--modifiers WITH_ALL_LOCALES --modifiers WITHOUT_LINK_RESOLUTION
```

```ts
export type TypeAnimal<
  Modifiers extends ChainModifiers = 'WITH_ALL_LOCALES' | 'WITHOUT_LINK_RESOLUTION',
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeAnimalSkeleton, Modifiers, Locales>;
```

### Link Resolution Tips

If you want resolved assets and entries without unresolved-link unions, call the client with the matching chain modifier:

```ts
const articles = await client.withoutUnresolvableLinks.getEntries<TypeBlogArticleSkeleton>({
  content_type: 'blogArticle',
  include: 4,
});

articles.items[0]?.fields.image?.fields.file?.url;
articles.items[0]?.fields.category?.[0]?.fields;
```

If a reference field allows multiple content types, generate type guards with `--typeguard` and narrow linked entries where you use them.

## Programmatic Usage

```ts
import {
  CFDefinitionsBuilder,
  ContentTypeRenderer,
  ResponseTypeRenderer,
  TypeGuardRenderer,
} from 'cf-content-types-generator';

const builder = new CFDefinitionsBuilder([
  new ContentTypeRenderer(),
  new TypeGuardRenderer(),
  new ResponseTypeRenderer(),
]);
```

If you want custom output, extend `BaseContentTypeRenderer` or implement the `Renderer` interface.

## Input

This tool accepts either:

- a local JSON file in the exact shape produced by `contentful space export`
- or enough CLI credentials for the generator to fetch equivalent model data live

Typical export command:

```bash
contentful space export --config ./export-config.json
```

If you pass a local file, that exported JSON shape is the exact shape this tool expects.

When you fetch the model remotely, this tool intentionally skips entry data and only reads schema data. A log line about skipping content entries is expected and does not mean generation is incomplete.

At minimum, this generator needs a JSON object with a `contentTypes` field. A full `contentful space export` dump usually also contains keys such as `entries`, `assets`, `locales`, `roles`, `webhooks`, and `editorInterfaces`, but this generator mainly reads `contentTypes` and `editorInterfaces`.

Example shape:

```json
{
  "contentTypes": [
    {
      "sys": {
        "id": "animal",
        "type": "ContentType"
      },
      "name": "Animal",
      "fields": [
        {
          "id": "breed",
          "type": "Symbol",
          "required": false,
          "localized": false,
          "omitted": false,
          "disabled": false,
          "validations": []
        }
      ]
    }
  ]
}
```

## Migration From 2.x To 3.x

`3.x` removes all pre-v10 output behavior. If you are upgrading from `2.x`, use this migration path:

1. Remove `--v10` from CLI usage.
2. Remove `--localized`; no replacement needed.
3. Rename programmatic imports:
   `V10ContentTypeRenderer` -> `ContentTypeRenderer`
   `V10TypeGuardRenderer` -> `TypeGuardRenderer`
   `createV10Context()` -> `createContext()`
4. Regenerate all generated types.
5. Update downstream code that still assumes classic `Entry<TypeFields>` output.

CLI before:

```bash
cf-content-types-generator ./contentful-export.json -o src/@types/generated --v10 --response
```

CLI after:

```bash
cf-content-types-generator ./contentful-export.json -o src/@types/generated --response
```

Programmatic before:

```ts
import {
  CFDefinitionsBuilder,
  V10ContentTypeRenderer,
  V10TypeGuardRenderer,
} from 'cf-content-types-generator';

const builder = new CFDefinitionsBuilder([
  new V10ContentTypeRenderer(),
  new V10TypeGuardRenderer(),
]);
```

Programmatic after:

```ts
import {
  CFDefinitionsBuilder,
  ContentTypeRenderer,
  TypeGuardRenderer,
} from 'cf-content-types-generator';

const builder = new CFDefinitionsBuilder([new ContentTypeRenderer(), new TypeGuardRenderer()]);
```

If downstream code still expects classic output, regenerate and adapt those types in the same change.

## Development

```bash
pnpm test
pnpm build
```

Related app: [cf-content-types-generator-app](https://github.com/marcolink/cf-content-types-generator-app)
