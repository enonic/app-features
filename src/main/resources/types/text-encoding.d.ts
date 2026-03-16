declare module '/lib/text-encoding' {
    import type { ByteSource } from '@enonic-types/core';

    export function base64Encode(stream: ByteSource | string): string;

    export function base64Decode(text: string): ByteSource;

    export function base64UrlEncode(stream: ByteSource | string): string;

    export function base64UrlDecode(text: string): ByteSource;

    export function base32Encode(stream: ByteSource | string): string;

    export function base32Decode(text: string): ByteSource;

    export function hexEncode(stream: ByteSource | string): string;

    export function hexDecode(text: string): ByteSource;

    export function charsetDecode(stream: ByteSource, charset: string): string;

    export function charsetEncode(text: string, charset: string): ByteSource;

    export function urlEscape(text: string): string;

    export function urlUnescape(text: string): string;

    export function htmlEscape(text: string): string;

    export function htmlUnescape(text: string): string;

    export function xmlEscape(text: string): string;

    export function xmlUnescape(text: string): string;

    export function md5(stream: ByteSource | string): string;

    export function md5AsStream(stream: ByteSource | string): ByteSource;

    export function sha1(stream: ByteSource | string): string;

    export function sha1AsStream(stream: ByteSource | string): ByteSource;

    export function sha256(stream: ByteSource | string): string;

    export function sha256AsStream(stream: ByteSource | string): ByteSource;

    export function sha512(stream: ByteSource | string): string;

    export function sha512AsStream(stream: ByteSource | string): ByteSource;

    export function hmacSha1AsHex(stream: ByteSource | string, key: string): string;

    export function hmacSha1AsStream(stream: ByteSource | string, key: string): ByteSource;

    export function hmacSha256AsHex(stream: ByteSource | string, key: string): string;

    export function hmacSha256AsStream(stream: ByteSource | string, key: string): ByteSource;

    export function hmacSha512AsHex(stream: ByteSource | string, key: string): string;

    export function hmacSha512AsStream(stream: ByteSource | string, key: string): ByteSource;
}

export {};
