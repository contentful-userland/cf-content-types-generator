import {InterfaceDeclaration, NamespaceDeclaration, SourceFile, StatementedNode} from 'ts-morph';

type WithInterface = Pick<StatementedNode, 'getInterfaces' | 'getInterface' | 'addInterface'>;

export const ensureNamespace = (file: SourceFile, name: string): NamespaceDeclaration => {
    const ns = file.getNamespace(name) || file.addNamespace({name});
    ns.setIsDefaultExport(true);
    return ns;
};

export const mergeInterfaceDeclarations = (sourceFile: SourceFile, targetFile: SourceFile): void => {
    const addInterfaceDeclarationToMergeFile = (
        interfaceDeclaration: InterfaceDeclaration,
        targetNamespace?: string
    ) => {
        let target: WithInterface = targetFile;

        if (targetNamespace) {
            target = ensureNamespace(targetFile, targetNamespace);
        }
        if (!target.getInterface(interfaceDeclaration.getName())) {
            const targetInterface = target.addInterface(interfaceDeclaration.getStructure());
            targetInterface!.setIsExported(true);
        }
    };

    const appendSourceInterfaces = (
        source: WithInterface,
        targetNamespace?: string,
    ): void => {
        const interfaces = source.getInterfaces();
        interfaces.forEach(sInterface => addInterfaceDeclarationToMergeFile(sInterface, targetNamespace));
    };

    const sourceNamespaces = sourceFile.getNamespaces();
    if (sourceNamespaces) {
        sourceNamespaces.forEach(sNs => appendSourceInterfaces(sNs, sNs.getName()));
    }
    appendSourceInterfaces(sourceFile);
};
