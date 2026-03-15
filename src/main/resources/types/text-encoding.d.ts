declare module '/lib/text-encoding' {
    export function base64Encode(stream: any): string;

    export function base64Decode(text: string): any;

    export function base64UrlEncode(stream: any): string;

    export function base64UrlDecode(text: string): any;

    export function base32Encode(stream: any): string;

    export function base32Decode(text: string): any;

    export function hexEncode(stream: any): string;

    export function hexDecode(text: string): any;

    export function charsetDecode(stream: any, charset: string): string;

    export function charsetEncode(text: string, charset: string): any;

    export function urlEscape(text: string): string;

    export function urlUnescape(text: string): string;

    export function htmlEscape(text: string): string;

    export function htmlUnescape(text: string): string;

    export function xmlEscape(text: string): string;

    export function xmlUnescape(text: string): string;

    export function md5(stream: any): string;

    export function md5AsStream(stream: any): any;

    export function sha1(stream: any): string;

    export function sha1AsStream(stream: any): any;

    export function sha256(stream: any): string;

    export function sha256AsStream(stream: any): any;

    export function sha512(stream: any): string;

    export function sha512AsStream(stream: any): any;

    export function hmacSha1AsHex(stream: any, key: string): string;

    export function hmacSha1AsStream(stream: any, key: string): any;

    export function hmacSha256AsHex(stream: any, key: string): string;

    export function hmacSha256AsStream(stream: any, key: string): any;

    export function hmacSha512AsHex(stream: any, key: string): string;

    export function hmacSha512AsStream(stream: any, key: string): any;
}

export {};
