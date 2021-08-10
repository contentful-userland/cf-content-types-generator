type LocalizedFields<Fields, Locales extends keyof any> = {
    [FieldName in keyof Fields]?: {
        [LocaleName in Locales]?: Fields[FieldName];
    }
}

type LocalizedEntry<EntryType, Locales extends keyof any> = {
    [Key in keyof EntryType]:
    Key extends 'fields'
        ? LocalizedFields<EntryType[Key], Locales>
        : EntryType[Key]
}
