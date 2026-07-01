import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as cacheLib from '/lib/cache';
import type {Request} from '@enonic-types/core';

const SHORT_TTL_SECONDS = 3;

const mainCache = cacheLib.newCache({
    size: 100,
    expire: 3600
});

const shortLivedCache = cacheLib.newCache({
    size: 100,
    expire: SHORT_TTL_SECONDS
});

const tinyCache = cacheLib.newCache({
    size: 2,
    expire: 3600
});

const isolatedCacheA = cacheLib.newCache({
    size: 10,
    expire: 3600
});

const isolatedCacheB = cacheLib.newCache({
    size: 10,
    expire: 3600
});

const view = resolve('cache.html');

type Probe = {
    label: string;
    description: string;
    keyShown: string;
    valueBefore: string;
    valueAfter: string;
    hit: boolean;
    note: string;
};

function timestamp(): string {
    return new Date().toISOString();
}

function uniqueValue(prefix: string): string {
    return prefix + '@' + timestamp();
}

function runGetOrCreate(): Probe {
    const key = 'demo:get-or-create';
    const before = mainCache.getIfPresent<string>(key);
    const valueBefore = mainCache.get(key, () => uniqueValue('computed'));
    const valueAfter = mainCache.get(key, () => uniqueValue('SHOULD-NOT-BE-USED'));
    return {
        label: 'get / getOrCreate (MISS then HIT)',
        description: 'First call populates the cache; subsequent calls return the same value without invoking the fetcher again.',
        keyShown: key,
        valueBefore,
        valueAfter,
        hit: before !== null,
        note: before === null ? 'Cache was empty on entry (MISS expected on first request).' : 'Cache had this entry on entry (HIT).'
    };
}

function runTtlExpiry(): Probe {
    const key = 'demo:ttl';
    const before = shortLivedCache.getIfPresent<string>(key);
    const valueBefore = shortLivedCache.get(key, () => uniqueValue('ttl'));
    return {
        label: 'TTL expiry (' + SHORT_TTL_SECONDS + 's cache)',
        description: 'Entry is recomputed after the configured expire window elapses. Reload after ' + SHORT_TTL_SECONDS + 's to observe a fresh timestamp.',
        keyShown: key,
        valueBefore,
        valueAfter: valueBefore,
        hit: before !== null,
        note: before === null ? 'Recomputed (MISS).' : 'Still within TTL (HIT).'
    };
}

function runRemove(req: Request): Probe {
    const key = 'demo:remove';
    const force = req.params.evict === '1';
    const before = mainCache.getIfPresent<string>(key);
    if (force && before !== null) {
        mainCache.remove(key);
    }
    const afterRemovePeek = mainCache.getIfPresent<string>(key);
    const valueAfter = mainCache.get(key, () => uniqueValue('remove'));
    return {
        label: 'remove(key) — explicit eviction',
        description: 'Append ?evict=1 to drop this specific entry. The next load recomputes it.',
        keyShown: key,
        valueBefore: before === null ? '(missing)' : before,
        valueAfter,
        hit: before !== null && !force,
        note: force ? 'Eviction requested. Peek-after-remove was ' + (afterRemovePeek === null ? 'null (removed).' : 'still present (unexpected).') : 'No eviction requested.'
    };
}

function runMaxSizeEviction(): Probe {
    tinyCache.clear();
    tinyCache.put('one', 'first');
    tinyCache.put('two', 'second');
    const sizeBeforeOverflow = tinyCache.getSize();
    tinyCache.put('three', 'third');
    const sizeAfterOverflow = tinyCache.getSize();
    return {
        label: 'max-size eviction (size=2)',
        description: 'Fill a 2-slot cache with 3 entries. The cache caps at the configured size.',
        keyShown: 'one / two / three',
        valueBefore: 'size=' + sizeBeforeOverflow,
        valueAfter: 'size=' + sizeAfterOverflow,
        hit: sizeAfterOverflow <= 2,
        note: sizeAfterOverflow <= 2 ? 'Size capped at 2 after inserting a 3rd entry.' : 'Eviction did not occur — unexpected.'
    };
}

function runClear(): Probe {
    const scratch = cacheLib.newCache({size: 10, expire: 3600});
    scratch.put('a', 'A');
    scratch.put('b', 'B');
    scratch.put('c', 'C');
    const sizeBefore = scratch.getSize();
    scratch.clear();
    const sizeAfter = scratch.getSize();
    return {
        label: 'clear() — full wipe',
        description: 'After clear(), getSize() reports zero entries.',
        keyShown: 'a, b, c',
        valueBefore: 'size=' + sizeBefore,
        valueAfter: 'size=' + sizeAfter,
        hit: sizeAfter === 0,
        note: sizeAfter === 0 ? 'Cache fully cleared.' : 'Cache was not cleared — unexpected.'
    };
}

function runIndependentCaches(): Probe {
    const key = 'demo:shared-key';
    isolatedCacheA.clear();
    isolatedCacheB.clear();
    const a = isolatedCacheA.get(key, () => 'from-A');
    const b = isolatedCacheB.get(key, () => 'from-B');
    return {
        label: 'independent cache instances',
        description: 'Two caches do not share a keyspace; the same key maps to different values.',
        keyShown: key,
        valueBefore: 'cacheA[' + key + ']=' + a,
        valueAfter: 'cacheB[' + key + ']=' + b,
        hit: a !== b,
        note: a !== b ? 'Caches are isolated.' : 'Caches collided — unexpected.'
    };
}

function runRemovePattern(): Probe {
    const scratch = cacheLib.newCache({size: 10, expire: 3600});
    scratch.put('product:1', '1');
    scratch.put('product:2', '2');
    scratch.put('user:1', 'u1');
    const sizeBefore = scratch.getSize();
    scratch.removePattern('product:.*');
    const sizeAfter = scratch.getSize();
    const productGone = scratch.getIfPresent<string>('product:1');
    const userKept = scratch.getIfPresent<string>('user:1');
    return {
        label: 'removePattern(regex)',
        description: 'Drop entries whose keys match a regular expression while leaving unrelated keys intact.',
        keyShown: 'product:1, product:2, user:1',
        valueBefore: 'size=' + sizeBefore + ', product:1=' + (productGone === null ? '(removed)' : productGone),
        valueAfter: 'size=' + sizeAfter + ', user:1=' + String(userKept),
        hit: productGone === null && userKept === 'u1',
        note: (productGone === null && userKept === 'u1') ? 'Pattern removed product:* and kept user:1.' : 'Unexpected state after removePattern.'
    };
}

function runPutAndGetIfPresent(): Probe {
    const scratch = cacheLib.newCache({size: 10, expire: 3600});
    const missing = scratch.getIfPresent<string>('absent');
    scratch.put('present', uniqueValue('put'));
    const present = scratch.getIfPresent<string>('present');
    return {
        label: 'put + getIfPresent',
        description: 'put() stores unconditionally; getIfPresent() returns null without invoking a fetcher when the key is absent.',
        keyShown: 'absent / present',
        valueBefore: 'absent=' + String(missing),
        valueAfter: 'present=' + String(present),
        hit: missing === null && present !== null,
        note: (missing === null && present !== null) ? 'getIfPresent behaves as documented.' : 'Unexpected getIfPresent result.'
    };
}

export const GET = function (req: Request) {
    const probes: Probe[] = [
        runGetOrCreate(),
        runTtlExpiry(),
        runRemove(req),
        runMaxSizeEviction(),
        runClear(),
        runIndependentCaches(),
        runRemovePattern(),
        runPutAndGetIfPresent()
    ];

    const params = {
        probes: probes,
        evictUrl: portal.componentUrl({params: {evict: '1'}}),
        reloadUrl: portal.componentUrl({}),
        ttl: SHORT_TTL_SECONDS,
        renderedAt: timestamp()
    };

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, params)
    };
};
