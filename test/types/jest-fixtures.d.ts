declare module 'jest-fixtures' {
    export function createTempDir(): Promise<string>;
    export function cleanupTempDirs(): Promise<void>;
}
