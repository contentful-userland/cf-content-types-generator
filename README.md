# TS contentful content types generator (contentful-ctg)

> A CLI to generate Typescript definitions based on [JSON export](https://github.com/contentful/contentful-cli/tree/master/docs/space/export) generated with [contentful CLI](https://github.com/contentful/contentful-cli).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/contentful-ctg.svg)](https://npmjs.org/package/contentful-ctg)
[![Downloads/week](https://img.shields.io/npm/dw/contentful-ctg.svg)](https://npmjs.org/package/contentful-ctg)
[![License](https://img.shields.io/npm/l/contentful-ctg.svg)](https://github.com/contentful-labs/contentful-ctg/blob/master/package.json)

# Table of Contents
- [Motivation](#motivation)
- [Usage](#usage)
    - [Example](#example)
    - [Input](#input)
    - [Output](#output)
    - [Direct Usage](#direct-usage)
- [Questions](#questions)

## Motivation
To learn more about the data structures we provide and expose i started manually writing type definitions for data provided by our entries endpoints. 

Playing around with the contentful CLI lead to the idea to automate the process of type generation by using the provided `contentTypes` data of the `export` command. This is the result of a first prototype ...

After implementing my own solution, i found [this](https://github.com/watermarkchurch/ts-generators) way more advanced project with the same purpose.

## Usage

```bash
Generate (TS) Content Types

USAGE
  $ contentful-ctg [FILE]

OPTIONS
  -h, --help                   show CLI help
  -i, --indent=space|tab       [default: space] indention type
  -n, --namespace=namespace    declare types inside a namespace
  -s, --indentSize=indentSize  [default: 2] indention size
  -t, --type=type|interface    [default: type] type or interface declaration
  -v, --version                show CLI version
```

### Example
```bash
contentful-ctg path/to/exported/file.json --namespace Collection
```
> in a real world scenario, you would pipe the result to a file.

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

### output 
```typescript
// Auto-generated TS definitions for Contentful Data models.

import * as Contentful from "contentful";
import * as CFRichTextTypes from "@contentful/rich-text-types";

// --namespace Collection --type type
namespace Collection {
    
    type Artist = {
        name: Contentful.EntryFields.Symbol;
        profilePicture?: Contentful.Asset;
        bio?: CFRichTextTypes.Block | CFRichTextTypes.Inline;
        dateOfBirth?: Contentful.EntryFields.Date;
    }

    type Artwork = {
        name: Contentful.EntryFields.Symbol;
        type?: "print" | "drawing" | "painting";
        images?: Contentful.Asset[];
        artist: Contentful.Entry<Artist>;
    }

}

// --type interface
interface Artist  {
    name: Contentful.EntryFields.Symbol;
    profilePicture?: Contentful.Asset;
    bio?: CFRichTextTypes.Block | CFRichTextTypes.Inline;
    dateOfBirth?: Contentful.EntryFields.Date;
}

interface Artwork  {
    name: Contentful.EntryFields.Symbol;
    type?: "print" | "drawing" | "painting";
    images?: Contentful.Asset[];
    artist: Contentful.Entry<Artist>;
}
```
This all only works if you add the `contentful` package to your target project to get all relevant type definitions.

### Direct Usage
If you're not a CLI person, or you want to integrate it with your tooling workflow, you can also directly use the `CFDefinitionsBuilder` from `cf-definitions-builder.ts`

```typescript
const stringContent = new CFDefinitionsBuilder()
    .setCustomNamespace("Contentfuel")
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

# Questions
- Should we provide additional `Entry` types? E.g. `Entry<Artist>`?
- Is `Contentful` the right namespace for internal references to avoid colliding namespaces?
- What is a good way to evaluate all possible payloads/data types?

# >> Happy typing!

# Inspiration
- [CLI best practice](https://github.com/lirantal/nodejs-cli-apps-best-practices)
