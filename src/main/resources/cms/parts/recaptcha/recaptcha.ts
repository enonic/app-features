import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as recaptcha from '/lib/recaptcha';
import type {PartComponent, Request} from '@enonic-types/core';

const view = resolve('recaptcha.html');

type Variant = 'v2' | 'v3';

interface Verification {
    attempted: boolean;
    success: boolean;
    accepted: boolean;
    score: number | null;
    threshold: number | null;
    variant: Variant;
    reason: string;
    errorCodes: string[];
    simulatedScore: boolean;
    raw?: string;
}

type RecaptchaPartConfig = {
    variant?: Variant;
    scoreThreshold?: number | string;
};

export const GET = function (req: Request) {
    return handle(req);
};

export const POST = function (req: Request) {
    return handle(req);
};

function handle(req: Request) {
    const component = portal.getComponent<PartComponent<never, RecaptchaPartConfig>>();
    const config: RecaptchaPartConfig = component && component.config ? component.config : {};

    const variant: Variant = resolveVariant(req.params.variant as string | undefined, config.variant);
    const threshold = resolveThreshold(req.params.threshold as string | undefined, config.scoreThreshold);
    const simulatedScore = parseFloatOrNull(req.params.simulatedScore as string | undefined);
    const format = (req.params.format as string | undefined) || 'html';
    const forceFail = req.params.forceFail === 'true';

    const tokenFromForm = (req.params['g-recaptcha-response'] as string) || '';
    const tokenFromQuery = (req.params.token as string) || '';
    let token = tokenFromForm || tokenFromQuery;
    if (forceFail && !token) {
        token = 'this-is-a-deliberately-invalid-token-for-testing';
    }

    const shouldVerify = req.method === 'POST' || forceFail || simulatedScore !== null || !!token;
    const verification = shouldVerify ? computeVerification(token, threshold, simulatedScore, variant) : null;

    if (format === 'json') {
        return {
            contentType: 'application/json',
            body: JSON.stringify(verification, null, 2)
        };
    }

    return renderHtml(req, variant, threshold, verification);
}

function resolveVariant(fromQuery: string | undefined, fromConfig: Variant | undefined): Variant {
    if (fromQuery === 'v3' || fromQuery === 'v2') {
        return fromQuery;
    }
    if (fromConfig === 'v3') {
        return 'v3';
    }
    return 'v2';
}

function resolveThreshold(fromQuery: string | undefined, fromConfig: number | string | undefined): number {
    const queryParsed = parseFloatOrNull(fromQuery);
    if (queryParsed !== null) {
        return queryParsed;
    }
    if (typeof fromConfig === 'number') {
        return fromConfig;
    }
    if (typeof fromConfig === 'string') {
        const configParsed = parseFloat(fromConfig);
        if (!isNaN(configParsed)) {
            return configParsed;
        }
    }
    return 0.5;
}

function parseFloatOrNull(s: string | undefined): number | null {
    if (s === undefined || s === '') {
        return null;
    }
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
}

function computeVerification(token: string, threshold: number, simulatedScore: number | null, variant: Variant): Verification {
    if (!recaptcha.isConfigured()) {
        return {
            attempted: false,
            success: false,
            accepted: false,
            score: null,
            threshold: variant === 'v3' ? threshold : null,
            variant: variant,
            reason: 'reCAPTCHA is not configured: site key or secret missing in site config.',
            errorCodes: [],
            simulatedScore: false
        };
    }

    if (!token) {
        return {
            attempted: false,
            success: false,
            accepted: false,
            score: null,
            threshold: variant === 'v3' ? threshold : null,
            variant: variant,
            reason: 'No reCAPTCHA token submitted.',
            errorCodes: [],
            simulatedScore: false
        };
    }

    let raw: {success?: boolean; score?: number; 'error-codes'?: string[]};
    try {
        raw = recaptcha.verify(token) as typeof raw;
    } catch (e) {
        const message = (e as Error).message || String(e);
        return {
            attempted: true,
            success: false,
            accepted: false,
            score: null,
            threshold: variant === 'v3' ? threshold : null,
            variant: variant,
            reason: 'Verify call threw: ' + message,
            errorCodes: [],
            simulatedScore: false
        };
    }

    const realScore = typeof raw.score === 'number' ? raw.score : null;
    const score = simulatedScore !== null ? simulatedScore : realScore;
    const usedSimulated = simulatedScore !== null;

    let accepted: boolean;
    let reason: string;
    if (variant === 'v3' && score !== null) {
        if (raw.success !== true) {
            accepted = false;
            reason = 'Token rejected by Google before threshold check.';
        } else if (score >= threshold) {
            accepted = true;
            reason = 'Accepted: score ' + score + ' >= threshold ' + threshold + '.';
        } else {
            accepted = false;
            reason = 'Rejected: score ' + score + ' < threshold ' + threshold + '.';
        }
    } else {
        accepted = raw.success === true;
        reason = raw.success === true
            ? 'Token verified successfully by Google.'
            : 'Token rejected by Google.';
    }

    return {
        attempted: true,
        success: raw.success === true,
        accepted: accepted,
        score: score,
        threshold: variant === 'v3' ? threshold : null,
        variant: variant,
        reason: reason,
        errorCodes: raw['error-codes'] || [],
        simulatedScore: usedSimulated,
        raw: JSON.stringify(raw, null, 2)
    };
}

function renderHtml(req: Request, variant: Variant, threshold: number, verification: Verification | null) {
    const isConfigured = recaptcha.isConfigured();
    const siteKey = recaptcha.getSiteKey();
    const editMode = req.mode === 'edit';

    const params = {
        postUrl: portal.componentUrl({}),
        siteKey: siteKey,
        variant: variant,
        isV2: variant === 'v2',
        isV3: variant === 'v3',
        threshold: threshold,
        recaptchaIsConfigured: isConfigured,
        editMode: editMode,
        verification: verification
    };

    const body = thymeleaf.render(view, params);

    const headEnd: string[] = [];
    if (isConfigured && !editMode) {
        if (variant === 'v3') {
            headEnd.push('<script src="https://www.google.com/recaptcha/api.js?render=' + siteKey + '" async defer></script>');
        } else {
            headEnd.push('<script src="https://www.google.com/recaptcha/api.js" async defer></script>');
        }
    }

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: headEnd
        }
    };
}
