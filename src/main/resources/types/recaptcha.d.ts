declare module '/lib/recaptcha' {
    interface VerifyResponse {
        success: boolean;
        score?: number;
        action?: string;
        challenge_ts?: string;
        hostname?: string;
        'error-codes'?: string[];
    }

    export function getSiteKey(): string;
    export function getSecretKey(): string;
    export function isConfigured(): boolean;
    export function verify(token: string): VerifyResponse;
}

export {};
