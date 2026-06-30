import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as recaptcha from '/lib/recaptcha';
import type {Request} from '@enonic-types/core';

const view = resolve('recaptcha.html');

export const GET = function (req: Request) {
    return render(req, null);
};

export const POST = function (req: Request) {
    const token = (req.params['g-recaptcha-response'] as string) || (req.params.token as string) || '';

    let verification: {
        attempted: boolean;
        success: boolean;
        raw?: string;
        message?: string;
    } = {attempted: false, success: false};

    if (!recaptcha.isConfigured()) {
        verification = {
            attempted: false,
            success: false,
            message: 'reCAPTCHA is not configured: cannot verify token.'
        };
    } else if (!token) {
        verification = {
            attempted: false,
            success: false,
            message: 'No reCAPTCHA token submitted.'
        };
    } else {
        try {
            const result = recaptcha.verify(token);
            verification = {
                attempted: true,
                success: result.success === true,
                raw: JSON.stringify(result, null, 2),
                message: result.success
                    ? 'Token verified successfully by Google.'
                    : 'Verification failed.'
            };
        } catch (e: any) {
            verification = {
                attempted: true,
                success: false,
                message: 'Verification error: ' + e.message
            };
        }
    }

    return render(req, verification);
};

function render(req: Request, verification: Record<string, unknown> | null) {
    const isConfigured = recaptcha.isConfigured();
    const siteKey = recaptcha.getSiteKey();
    const editMode = req.mode === 'edit';

    const params = {
        postUrl: portal.componentUrl({}),
        siteKey: siteKey,
        recaptchaIsConfigured: isConfigured,
        editMode: editMode,
        verification: verification
    };

    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body,
        pageContributions: {
            headEnd: isConfigured && !editMode
                ? ['<script src="https://www.google.com/recaptcha/api.js" async defer></script>']
                : []
        }
    };
}
