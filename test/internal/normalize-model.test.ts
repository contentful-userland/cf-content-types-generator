import { normalizeModel } from '../../src/internal/normalize-model';

describe('normalizeModel', () => {
  it('normalizes content types and editor interfaces', () => {
    const model = normalizeModel({
      source: {
        kind: 'remote',
      },
      data: {
        contentTypes: [
          {
            name: 'Animal',
            sys: {
              id: 'animal',
              type: 'ContentType',
              createdBy: {
                sys: {
                  id: 'user-id',
                },
              },
              publishedVersion: 5,
            },
            fields: [
              {
                id: 'breed',
                name: 'Breed',
                type: 'Symbol',
                localized: false,
                required: true,
                validations: [],
                disabled: false,
                omitted: false,
              },
            ],
          },
        ],
        editorInterfaces: [
          {
            sys: {
              contentType: {
                sys: {
                  id: 'animal',
                },
              },
            },
            controls: [
              {
                fieldId: 'breed',
                settings: {
                  helpText: 'Helpful text',
                },
              },
            ],
          },
        ],
      },
    });

    expect(model.contentTypes[0].sys.createdBy?.sys.id).toBe('user-id');
    expect(model.contentTypes[0].sys.publishedVersion).toBe(5);
    expect(model.contentTypes[0].fields[0]).toMatchObject({
      id: 'breed',
      name: 'Breed',
      type: 'Symbol',
    });
    expect(model.editorInterfaces[0].controls[0].settings?.helpText).toBe('Helpful text');
  });

  it('preserves field validation and link metadata', () => {
    const model = normalizeModel({
      source: {
        kind: 'remote',
      },
      data: {
        contentTypes: [
          {
            name: 'Animal',
            sys: {
              id: 'animal',
              type: 'ContentType',
            },
            fields: [
              {
                id: 'friend',
                name: 'Friend',
                type: 'Link',
                localized: false,
                required: false,
                validations: [{ linkContentType: ['animal'] }],
                disabled: false,
                omitted: false,
                linkType: 'Entry',
              },
            ],
          },
        ],
      },
    });

    expect(model.contentTypes[0].fields[0]).toMatchObject({
      id: 'friend',
      validations: [{ linkContentType: ['animal'] }],
      linkType: 'Entry',
    });
  });

  it('keeps missing contentTypes error deterministic for file input', () => {
    expect(() =>
      normalizeModel({
        source: {
          kind: 'file',
          filePath: '/tmp/contentful-export.json',
        },
        data: {},
      }),
    ).toThrow('file /tmp/contentful-export.json is missing "contentTypes" field');
  });
});
