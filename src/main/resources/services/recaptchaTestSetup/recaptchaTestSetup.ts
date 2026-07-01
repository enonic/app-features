import * as contextLib from '/lib/xp/context';
import * as contentLib from '/lib/xp/content';
import type {Request} from '@enonic-types/core';

const PROJECT_ID = 'features';
const SITE_PATH = '/features';
const APP_KEY = 'com.enonic.app.features';

interface SetupParams {
    siteKey?: string;
    secretKey?: string;
}

export function post(req: Request) {
    let payload: SetupParams = {};
    if (req.body) {
        try {
            payload = JSON.parse(req.body) as SetupParams;
        } catch (e) {
            return {
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({error: 'Invalid JSON body: ' + (e as Error).message})
            };
        }
    }

    const mode = (req.params.mode as string) || '';
    const siteKey = (req.params.siteKey as string) || payload.siteKey || '';
    const secretKey = (req.params.secretKey as string) || payload.secretKey || '';

    if (mode !== 'clear' && (!siteKey || !secretKey)) {
        return {
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({error: 'siteKey and secretKey required (or pass ?mode=clear to remove them)'})
        };
    }

    const effectiveSiteKey = mode === 'clear' ? '' : siteKey;
    const effectiveSecret = mode === 'clear' ? '' : secretKey;
    const result = contextLib.run(
        {
            principals: ['role:system.admin'],
            repository: 'com.enonic.cms.' + PROJECT_ID,
            branch: 'draft'
        },
        () => updateSiteConfig(effectiveSiteKey, effectiveSecret)
    );

    return {
        contentType: 'application/json',
        body: JSON.stringify(result, null, 2)
    };
}

function updateSiteConfig(siteKey: string, secretKey: string) {
    const site = contentLib.get({key: SITE_PATH});
    if (!site) {
        return {ok: false, error: 'Site not found at ' + SITE_PATH};
    }

    const modified = contentLib.modify({
        key: site._id,
        editor: (content: typeof site) => {
            const data = content.data as Record<string, unknown>;
            type SiteConfigEntry = {applicationKey: string; config?: Record<string, unknown>};
            const existing = data.siteConfig as SiteConfigEntry | SiteConfigEntry[] | undefined;
            const entries: SiteConfigEntry[] = !existing
                ? []
                : Array.isArray(existing) ? existing : [existing];

            let target: SiteConfigEntry | undefined;
            for (let i = 0; i < entries.length; i++) {
                if (entries[i].applicationKey === APP_KEY) {
                    target = entries[i];
                    break;
                }
            }
            if (!target) {
                target = {applicationKey: APP_KEY, config: {}};
                entries.push(target);
            }
            target.config = target.config || {};
            target.config.recaptchaSiteKey = siteKey;
            target.config.recaptchaSecretKey = secretKey;

            data.siteConfig = entries.length === 1 ? entries[0] : entries;
            return content;
        }
    });

    return {
        ok: true,
        siteId: modified._id,
        siteKey: siteKey,
        secretKeyLen: secretKey.length
    };
}
