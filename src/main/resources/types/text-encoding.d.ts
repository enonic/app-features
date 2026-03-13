declare module '/lib/text-encoding' {
    export class TextDecoder {
        constructor(encoding?: string);
        decode(input: any): string;
    }
    export class TextEncoder {
        constructor();
        encode(input: string): Uint8Array;
    }
}

export {};
