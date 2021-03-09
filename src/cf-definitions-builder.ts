import {Field, FieldType} from 'contentful';
import * as path from 'path';
import {
    forEachStructureChild,
    ImportDeclarationStructure,
    InterfaceDeclaration,
    OptionalKind,
    Project,
    ScriptTarget,
    SourceFile,
    StructureKind,
} from 'ts-morph';
import {propertyImports} from './cf-property-imports';
import {anyType} from './cf-property-types';
import {renderPropArray} from './renderer/cf-render-prop-array';
import {renderPropLink} from './renderer/cf-render-prop-link';
import {renderRichText} from './renderer/cf-render-prop-richtext';
import {renderTypeGeneric} from './renderer/render-type-generic';
import {moduleFieldsName, moduleName} from './utils';

export type CFContentType = {
    name: string;
    id: string;
    sys: {
        id: string;
        type: string;
    };
    fields: Field[];
};

export type WriteCallback = (filePath: string, content: string) => Promise<void>

type FieldRenderers = {
    [K in FieldType]?: Function
}

type CFDefinitionsBuilderConfig = {
    fieldRenderers?: FieldRenderers;
}

const defaultRenderers: FieldRenderers = {
    RichText: renderRichText,
    Link: renderPropLink,
    Array: renderPropArray,
    Text: anyType,
    Symbol: anyType,
    Object: anyType,
    Date: anyType,
    Number: anyType,
    Integer: anyType,
    Boolean: anyType,
    Location: anyType,
};

export default class CFDefinitionsBuilder {
    private readonly project: Project;

    private readonly config: Required<CFDefinitionsBuilderConfig>;

    constructor(config: CFDefinitionsBuilderConfig = {}) {
        this.config = {...{fieldRenderers: {}}, ...config};
        this.config.fieldRenderers = {...defaultRenderers, ...config.fieldRenderers};

        this.project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                target: ScriptTarget.ES5,
                declaration: true,
            },
        });
    }

    public appendType = (model: CFContentType): CFDefinitionsBuilder => {
        if (model.sys.type !== 'ContentType') {
            throw new Error('given data is not describing a ContentType');
        }

        const file = this.addFile(moduleName(model.sys.id));

        this.addDefaultImports(file);

        const interfaceDeclaration = this.createInterfaceDeclaration(file, moduleFieldsName(model.sys.id));

        model.fields.forEach(field => this.addProperty(file, interfaceDeclaration, field));

        this.addEntryTypeAlias(file, model.sys.id, moduleFieldsName(model.sys.id));

        file.organizeImports({
            ensureNewLineAtEndOfFile: true,
        });

        return this;
    };

    public write = async (dir: string, writeCallback: WriteCallback): Promise<void> => {
        this.addIndexFile();

        const writePromises = this.project.getSourceFiles().map(file => {
            const targetPath = path.resolve(dir, file.getFilePath().slice(1));
            return writeCallback(targetPath, file.getFullText());
        });
        await Promise.all(writePromises);
        this.removeIndexFile();
    };

    public toString = (): string => {
        const mergeFileName = 'ContentTypes';
        const mergeFile = this.addFile(mergeFileName);

        const imports: OptionalKind<ImportDeclarationStructure>[] = [];
        const types: string[] = [];

        this.project.getSourceFiles()
            .filter(sourceFile => sourceFile.getBaseNameWithoutExtension() !== mergeFileName)
            .forEach(sourceFile => forEachStructureChild(sourceFile.getStructure(),
                childStructure => {
                    switch (childStructure.kind) {
                    case StructureKind.ImportDeclaration:
                        imports.push(childStructure);
                        break;
                    case StructureKind.Interface:
                        types.push(childStructure.name);
                        mergeFile.addInterface(childStructure);
                        break;
                    case StructureKind.TypeAlias:
                        types.push(childStructure.name);
                        mergeFile.addTypeAlias(childStructure);
                        break;
                    default:
                        throw new Error(`Unhandled node type '${StructureKind[childStructure.kind]}'.`);
                    }
                }));

        // only import modules not present in merge file
        imports.forEach(importD => {
            const name = importD.moduleSpecifier.slice(2);
            if (!types.includes(name)) {
                mergeFile.addImportDeclaration(importD);
            }
        });

        mergeFile.organizeImports({
            ensureNewLineAtEndOfFile: true,
        });

        const fullText = mergeFile.getFullText();
        this.project.removeSourceFile(mergeFile);

        return fullText;
    }

    private addFile = (name: string): SourceFile => {
        return this.project.createSourceFile(`${name}.ts`,
            undefined,
            {
                overwrite: true,
            });
    };

    private createInterfaceDeclaration = (file: SourceFile, name: string): InterfaceDeclaration => {
        return file.addInterface({name, isExported: true});
    };

    private getIndexFile = (): SourceFile | undefined => {
        return this.project.getSourceFile(file => {
            return file.getBaseNameWithoutExtension() === 'index';
        });
    }

    private addIndexFile = (): void => {
        this.removeIndexFile();

        const files = this.project
            .getSourceFiles()
            .map(file => file.getBaseNameWithoutExtension());

        const indexFile = this.addFile('index');

        files.forEach(fileName => {
            indexFile.addExportDeclaration({
                isTypeOnly: true,
                namedExports: [moduleName(fileName), moduleFieldsName(fileName)],
                moduleSpecifier: `./${fileName}`,
            });
        });

        indexFile.organizeImports();
    };

    private removeIndexFile = () => {
        const indexFile = this.getIndexFile();
        if (indexFile) {
            this.project.removeSourceFile(indexFile);
        }
    }

    private addEntryTypeAlias = (file: SourceFile, aliasName: string, entryType: string) => {
        file.addTypeAlias({
            isExported: true,
            name: moduleName(aliasName),
            type: renderTypeGeneric('Contentful.Entry', entryType),
        });
    };

    private addProperty = (
        file: SourceFile,
        declaration: InterfaceDeclaration,
        field: Field,
    ): void => {
        declaration.addProperty({
            name: field.id,
            hasQuestionToken: field.omitted || (!field.required),
            type: this.config.fieldRenderers[field.type]!(field),
        });

        // eslint-disable-next-line no-warning-comments
        // TODO: dynamically define imports based on usage
        file.addImportDeclaration({
            moduleSpecifier: 'contentful',
            namespaceImport: 'Contentful',
        });

        file.addImportDeclaration({
            moduleSpecifier: '@contentful/rich-text-types',
            namespaceImport: 'CFRichTextTypes',
        });

        file.addImportDeclarations(propertyImports(field, file.getBaseNameWithoutExtension()));
    };

    private addDefaultImports(file: SourceFile) {
        file.addImportDeclaration({
            moduleSpecifier: 'contentful',
            namespaceImport: 'Contentful',
        });
    }
}

