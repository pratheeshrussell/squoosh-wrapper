declare namespace EmscriptenWasm {
    export interface Module {
        _malloc(size: number): number;
        _free(ptr: number): void;
        HEAPU8: Uint8Array;
        HEAPF32: Float32Array;
    }

    export interface ModuleFactory<T extends Module> {
        (moduleArg?: any): Promise<T>;
    }
}