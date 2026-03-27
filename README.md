# cf-content-types-generator

Generate TypeScript types from Contentful content types.

> Breaking in v3.x: this is the migration from `2.x` to `3.x`. Pre-v10 output is removed, and modern `contentful.js` typing becomes the default and only output model.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cf-content-types-generator.svg)](https://npmjs.org/package/cf-content-types-generator)
[![Downloads/week](https://img.shields.io/npm/dw/cf-content-types-generator.svg)](https://npmjs.org/package/cf-content-types-generator)
[![License](https://img.shields.io/npm/l/cf-content-types-generator.svg)](https://github.com/contentful-userland/cf-content-types-generator/blob/master/package.json)
[![Coverage Status](https://coveralls.io/repos/github/contentful-userland/cf-content-types-generator/badge.svg)](https://coveralls.io/github/contentful-userland/cf-content-types-generator)

## Why

- generate checked-in types from Contentful schema exports
- support local export JSON or direct remote fetch
- emit modern `EntrySkeletonType` / `Entry` typings
- layer optional response aliases, JSDoc, and type guards

## Install

```bash
npm install cf-content-types-generator contentful
```

Repo dev uses `pnpm@9.15.9` via Corepack:

```bash
corepack enable
pnpm install
```

## Quickstart

You can use this CLI in two ways:

- provide a static JSON file in the [Input](#input) shape, usually generated with `contentful space export`
- provide Contentful credentials and let the CLI fetch the schema on the fly

Generate from a local export JSON file:

```bash
cf-content-types-generator path/to/export.json -o src/@types/generated
```

Generate with optional helpers:

```bash
cf-content-types-generator path/to/export.json -o src/@types/generated --typeguard --response
```

Generate by fetching directly from Contentful on the fly:

```bash
cf-content-types-generator \
  -s <space-id> \
  -t <management-token> \
  -e <environment> \
  -o src/@types/generated
```

## CLI

```text
cf-content-types-generator [FILE]
```

Flags:

- `-o, --out` output directory
- `-p, --preserve` preserve existing output folder
- `-d, --jsdoc` add JSDoc comments
- `-g, --typeguard` add modern type guards
- `-r, --response` add response aliases
- `-s, --spaceId` Contentful space id
- `-t, --token` Contentful management token
- `-e, --environment` Contentful environment
- `-a, --host` Management API host

Removed in next major:

- `--v10`
- `--localized`

Both now error with explicit migration hints.

## Optional renderers

All examples below assume the same content type:

```ts
export interface TypeAnimalFields {
  breed?: EntryFieldTypes.Symbol;
}

export type TypeAnimalSkeleton = EntrySkeletonType<TypeAnimalFields, 'animal'>;
export type TypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> =
  Entry<TypeAnimalSkeleton, Modifiers, Locales>;
```

### `-d, --jsdoc`

Adds generated comments to fields, skeletons, and entries.

```ts
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
export type TypeAnimalWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> =
  TypeAnimal<'WITH_ALL_LOCALES', Locales>;
```

## Programmatic usage

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

## Example output

```ts
import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful';

export interface TypeAnimalFields {
  breed?: EntryFieldTypes.Symbol;
}

export type TypeAnimalSkeleton = EntrySkeletonType<TypeAnimalFields, 'animal'>;
export type TypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> =
  Entry<TypeAnimalSkeleton, Modifiers, Locales>;
```

## Migration from 2.x to 3.x

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
cf-content-types-generator path/to/export.json -o src/@types/generated --v10 --response
```

CLI after:

```bash
cf-content-types-generator path/to/export.json -o src/@types/generated --response
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

const builder = new CFDefinitionsBuilder([
  new ContentTypeRenderer(),
  new TypeGuardRenderer(),
]);
```

If downstream code still expects classic output, regenerate and adapt those types in the same change.

This PR introduces `3.x`, so every existing `2.x` user should treat the steps above as the required upgrade path.

## Input

This tool is built to consume the JSON export shape produced by the Contentful CLI `space export` command.

Typical source:

```bash
contentful space export --config ./export-config.json
```

In other words: if you already export your space with the official Contentful CLI, the generated JSON dump is the exact input shape this tool expects.

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

If you pass a local file, it should be one of these CLI export JSON files, or another JSON payload with the same structure.

## Development

```bash
pnpm test
pnpm build
```

Related app: [cf-content-types-generator-app](https://github.com/marcolink/cf-content-types-generator-app)
