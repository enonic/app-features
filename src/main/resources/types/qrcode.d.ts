declare module '/lib/qrcode' {
    import type { ByteSource } from '@enonic-types/core';

    export interface GenerateQrCodeParams {
        text: string;
        size?: number;
    }

    export function generateQrCode(params: GenerateQrCodeParams): ByteSource;
}

export {};
