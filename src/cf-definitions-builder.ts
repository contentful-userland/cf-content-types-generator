import * as fs from 'fs-extra';
import * as path from 'path';
import {Field} from 'contentful';
import {
    ImportDeclaration,
    InterfaceDeclaration,
    Project,
    ScriptTarget,
    SourceFile,
} from 'ts-morph';
import {propertyType} from './cf-property-types';
import {mergeInterfaceDeclarations} from './ts-morph-utils';
import {typeName, typeNameWithFields} from './utils';
import {typeImports} from './cf-property-imports';

export type CFContentType = {
    name: string;
    id: string;
    sys: {
        id: string;
        type: string;
    };
    fields: Field[];
};

export default class CFDefinitionsBuilder {
    private readonly project: Project;

    constructor() {
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

        const file = this.addFile(typeName(model.sys.id));

        const interfaceDeclaration = this.createInterfaceDeclaration(file, typeNameWithFields(model.sys.id));

        model.fields.forEach(field => this.addProperty(file, interfaceDeclaration, field));

        file.organizeImports({
            ensureNewLineAtEndOfFile: true,
        });

        return this;
    };

    public write = async (dir: string): Promise<void> => {
        const writePromises = this.project.getSourceFiles().map(file => {
            const targetPath = path.resolve(dir, file.getFilePath().slice(1));
            return fs.writeFile(targetPath, file.getFullText());
        });
        await Promise.all(writePromises);
    };

    public toString = (): string => this.mergeFile().getFullText();

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

    private addProperty = (
        file: SourceFile,
        declaration: InterfaceDeclaration,
        field: Field
    ): void => {
        declaration.addProperty({
            name: field.id,
            hasQuestionToken: field.omitted || (!field.required),
            type: propertyType(field),
        });

        file.addImportDeclarations(typeImports(field));

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
    };

    private mergeFile = (mergeFileName = 'ContentTypes'): SourceFile => {
        const mergeFile = this.addFile(mergeFileName);

        const addImportDeclarationToMergeFile = (importDeclaration: ImportDeclaration) => {
            // eslint-disable-next-line no-warning-comments
            // TODO: only merge if not already doesn't exist already
            mergeFile.addImportDeclaration(importDeclaration.getStructure());
        };

        this.project.getSourceFiles().forEach(sourceFile => {
            mergeInterfaceDeclarations(sourceFile, mergeFile);
            sourceFile.getImportDeclarations().forEach(addImportDeclarationToMergeFile);
        });

        mergeFile
            .getImportDeclarations()
            .filter(importD => importD.getModuleSpecifierValue().startsWith('./'))
            .forEach(importD => importD.remove());

        mergeFile.organizeImports({
            ensureNewLineAtEndOfFile: true,
        });

        return mergeFile;
    };
}

