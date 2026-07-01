declare module '/lib/notifications' {
    import type {ByteSource} from '@enonic-types/core';

    export interface KeyPair {
        privateKey: string;
        publicKey: string;
        privateKeyBytes: ByteSource;
        publicKeyBytes: ByteSource;
    }

    export interface SendParams {
        publicKey: string;
        privateKey: string;
        endpoint: string;
        auth: string;
        receiverKey: string;
        payload?: string | Record<string, unknown>;
    }

    export interface SendAsyncParams extends SendParams {
        success?: (status: number) => void;
        error?: () => void;
    }

    export function generateKeyPair(): KeyPair;

    export function send(notification: SendParams): number;

    export function sendAsync(notification: SendAsyncParams): void;
}

export {};
