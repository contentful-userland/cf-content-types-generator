# TS contentful content types generator (contentful-ctg)

> A CLI to generate Typescript definitions based on [JSON export](https://github.com/contentful/contentful-cli/tree/master/docs/space/export) generated with [contentful CLI](https://github.com/contentful/contentful-cli).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/contentful-ctg.svg)](https://npmjs.org/package/contentful-ctg)
[![Downloads/week](https://img.shields.io/npm/dw/contentful-ctg.svg)](https://npmjs.org/package/contentful-ctg)
[![License](https://img.shields.io/npm/l/contentful-ctg.svg)](https://github.com/contentful-labs/contentful-ctg/blob/master/package.json)

# Table of Contents
- [Installation](#installation)
- [Usage](#usage)
    - [Example](#example)
    - [Input](#input)
    - [Output](#output)
    - [Direct Usage](#direct-usage)
- [Questions](#questions)

## Installation

```bash
npm install @contentful/content-types-generator
```

## Usage

```bash
 Content Types Generator (TS)

USAGE
  $ contentful-ctg [FILE] [OUT]

OPTIONS
  -h, --help     show CLI help
  -v, --version  show CLI version
```

### Example
**Will print result to console**
```bash
contentful-ctg path/to/exported/file.json
```
> in a real world scenario, you would pipe the result to a file.

**Will store resulting files in target directory**
```bash
contentful-ctg path/to/exported/file.json path/to/target/out/directory 
```


### Input
As input a [json file](https://github.com/contentful/contentful-cli/tree/master/docs/space/export#exported-data) with a `contentTypes` field is expected:

```json
{
  "contentTypes": [
    {
      "sys": {
        "id": "artist",
        "type": "ContentType"
      },
      "displayField": "name",
      "name": "Artist",
      "fields": [
        {
          "id": "name",
          "name": "Name",
          "type": "Symbol",
          "required": true,
          "validations": [
            {
              "unique": true
            }
          ]
        },
        {
          "id": "profilePicture",
          "name": "Profile Picture",
          "type": "Link",
          "required": false,
          "validations": [
            {
              "linkMimetypeGroup": [
                "image"
              ]
            }
          ],
          "linkType": "Asset"
        },
        {
          "id": "bio",
          "name": "Bio",
          "type": "RichText",
          "required": false,
          "validations": [
            {
              "nodes": {
              }
            },
            {
              "enabledMarks": [
              ],
              "message": "Marks are not allowed"
            },
            {
              "enabledNodeTypes": [
              ],
              "message": "Nodes are not allowed"
            }
          ]
        }
      ]
    },
    {
      "sys": {
        "id": "artwork",
        "type": "ContentType"
      },
      "displayField": "name",
      "name": "Artwork",
      "fields": [
        {
          "id": "name",
          "name": "Name",
          "type": "Symbol",
          "required": true,
          "validations": [
          ]
        },
        {
          "id": "type",
          "name": "Type",
          "type": "Symbol",
          "required": false,
          "validations": [
            {
              "in": [
                "print",
                "drawing",
                "painting"
              ],
              "message": "Hello - this is a custom error message."
            }
          ]
        },
        {
          "id": "preview",
          "name": "Preview",
          "type": "Array",
          "required": false,
          "validations": [
          ],
          "items": {
            "type": "Link",
            "validations": [
              {
                "linkMimetypeGroup": [
                  "image",
                  "audio",
                  "video"
                ]
              }
            ],
            "linkType": "Asset"
          }
        },
        {
          "id": "artist",
          "name": "Artist",
          "type": "Link",
          "required": true,
          "validations": [
            {
              "linkContentType": [
                "artist"
              ]
            }
          ],
          "linkType": "Entry"
        }
      ]
    }
  ]
}
```
> This example shows a subset of the actual payload provided by contentful's cli export command.

### Output 
```typescript
import * as CFRichTextTypes from "@contentful/rich-text-types";
import * as Contentful from "contentful";

export interface ArtistFields {
    name: Contentful.EntryFields.Symbol;
    profilePicture?: Contentful.Asset;
    bio?: CFRichTextTypes.Block | CFRichTextTypes.Inline;
}

export type Artist = Contentful.Entry<ArtistFields>;

export interface ArtworkFields {
    name: Contentful.EntryFields.Symbol;
    type?: "print" | "drawing" | "painting";
    preview?: Contentful.Asset[];
    artist: Contentful.Entry<ArtistFields>;
}

export type Artwork = Contentful.Entry<ArtworkFields>;
```
This all only works if you add the [`contentful`](https://www.npmjs.com/package/contentful) package to your target project to get all relevant type definitions.

### Direct Usage
If you're not a CLI person, or you want to integrate it with your tooling workflow, you can also directly use the `CFDefinitionsBuilder` from `cf-definitions-builder.ts`

```typescript
const stringContent = new CFDefinitionsBuilder()
    .appendType({
        id: "rootId",
        name: "Root Name",
        sys: {
            id: "sysId",
            type: "ContentType",
        }, fields: [{
            id: "myFieldId",
            type: "Symbol",
            required: true,
            validations: []            
        }]
    })
    .toString();
```

# >> Happy typing!

# Inspiration
- [ts-generators](https://github.com/watermarkchurch/ts-generators)
- [CLI best practice](https://github.com/lirantal/nodejs-cli-apps-best-practices)
