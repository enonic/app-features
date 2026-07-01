import * as portal from '/lib/xp/portal';
import * as thymeleaf from '/lib/thymeleaf';
import * as geoip from '/lib/geoip';
import type {PartComponent, Request} from '@enonic-types/core';
import type {LocationData, SubdivisionInfo} from '/lib/geoip';

interface SampleSpec {
    ip: string;
    label: string;
    expectedISO?: string;
    expectedCountry?: string;
    expectedCity?: string;
    note?: string;
}

const KNOWN_SAMPLES: SampleSpec[] = [
    {ip: '81.2.69.142',   label: 'London IPv4',                  expectedISO: 'GB', expectedCountry: 'United Kingdom', expectedCity: 'London'},
    {ip: '89.160.20.112', label: 'Linköping IPv4',               expectedISO: 'SE', expectedCountry: 'Sweden',         expectedCity: 'Linköping'},
    {ip: '175.16.199.0',  label: 'Changchun IPv4',               expectedISO: 'CN', expectedCountry: 'China',          expectedCity: 'Changchun'},
    {ip: '216.160.83.56', label: 'Milton IPv4',                  expectedISO: 'US', expectedCountry: 'United States',  expectedCity: 'Milton'},
    {ip: '67.43.156.0',   label: 'Bhutan IPv4 (country-only)',   expectedISO: 'BT', expectedCountry: 'Bhutan'},
];

const IPV6_SAMPLES: SampleSpec[] = [
    {ip: '2001:218::1',  label: 'Tokyo IPv6',  expectedISO: 'JP', expectedCountry: 'Japan'},
    {ip: '2a02:cf40::1', label: 'Norway IPv6', expectedISO: 'NO', expectedCountry: 'Norway'},
];

const EDGE_SAMPLES: SampleSpec[] = [
    {ip: '192.168.1.1', label: 'Private IPv4 (RFC1918)',     note: 'No DB entry — getLocationData returns null'},
    {ip: '10.0.0.1',    label: 'Private IPv4 (RFC1918)',     note: 'No DB entry — getLocationData returns null'},
    {ip: '203.0.113.1', label: 'TEST-NET-3 (RFC5737)',       note: 'Valid format, reserved range — null'},
    {ip: 'not-an-ip',   label: 'Malformed input',            note: 'UnknownHostException swallowed by lib — null'},
];

const LANGS = ['en', 'de', 'fr', 'ja', 'ru', 'zh-CN'];

interface ConfiguredPart {
    config?: {
        ip?: string;
    };
}

interface LookupRow {
    ip: string;
    label: string;
    expectedISO: string;
    expectedCountry: string;
    expectedCity: string;
    note: string;
    resolved: boolean;
    countryISO: string | null;
    countryName: string | null;
    cityName: string | null;
    geoPoint: string | null;
    timeZone: string | null;
    postalCode: string | null;
    continent: string | null;
    subdivisions: string | null;
}

function safeLookup(ip: string): LocationData | null {
    try {
        return geoip.getLocationData(ip);
    } catch (e) {
        return null;
    }
}

function describeSubdivisions(subs: SubdivisionInfo[] | undefined): string | null {
    if (!subs || subs.length === 0) {
        return null;
    }
    return subs.map(s => {
        const iso = s?.iso_code ?? '?';
        const name = s?.names?.en ?? '';
        return name ? `${iso} ${name}` : iso;
    }).join(' / ');
}

function lookupOne(spec: SampleSpec): LookupRow {
    const data = safeLookup(spec.ip);
    return {
        ip: spec.ip,
        label: spec.label,
        expectedISO: spec.expectedISO ?? '',
        expectedCountry: spec.expectedCountry ?? '',
        expectedCity: spec.expectedCity ?? '',
        note: spec.note ?? '',
        resolved: !!data,
        countryISO: geoip.countryISO(data),
        countryName: geoip.countryName(data),
        cityName: geoip.cityName(data),
        geoPoint: geoip.geoPoint(data),
        timeZone: data?.location?.time_zone ?? null,
        postalCode: data?.postal?.code ?? null,
        continent: data?.continent?.names?.en ?? null,
        subdivisions: describeSubdivisions(data?.subdivisions),
    };
}

export const GET = function (req: Request) {
    return render(req, (req.params.ip as string) ?? undefined);
};

export const POST = function (req: Request) {
    return render(req, (req.params.ip as string) ?? undefined);
};

function render(req: Request, override: string | undefined) {
    let configuredIp: string | undefined;
    try {
        const part = portal.getComponent<PartComponent & ConfiguredPart>();
        configuredIp = part?.config?.ip ?? undefined;
    } catch (e) {
        configuredIp = undefined;
    }

    const remoteIp = req.remoteAddress;

    // Default the ad-hoc lookup to the first known sample: the remote address on
    // localhost is the loopback, which has no geolocation, so it makes a poor
    // default. An explicit ?ip= or part config still takes precedence.
    const lookupIp = (override || configuredIp || KNOWN_SAMPLES[0].ip).trim();

    let formResult: LocationData | null = null;
    let lookupError: string | undefined;
    try {
        formResult = geoip.getLocationData(lookupIp);
    } catch (e: any) {
        lookupError = e.message ?? String(e);
    }
    const formResolved = !!formResult;

    const knownResults = KNOWN_SAMPLES.map(lookupOne);
    const ipv6Results = IPV6_SAMPLES.map(lookupOne);
    const edgeResults = EDGE_SAMPLES.map(lookupOne);

    const dbReady = knownResults.some(r => r.resolved);
    const dbProbe = knownResults[0];

    let reference: LookupRow | undefined;
    for (let i = 0; i < knownResults.length; i++) {
        const r = knownResults[i];
        if (r.resolved && r.expectedCity) {
            reference = r;
            break;
        }
    }
    const referenceData = reference ? safeLookup(reference.ip) : null;

    const multilingualRows = LANGS.map(lang => ({
        language: lang,
        countryName: geoip.countryName(referenceData, lang),
        cityName: geoip.cityName(referenceData, lang),
    }));

    const distinctFields = referenceData ? {
        continentCode: referenceData.continent?.code ?? null,
        continentName: referenceData.continent?.names?.en ?? null,
        countryISO: referenceData.country?.iso_code ?? null,
        countryName: referenceData.country?.names?.en ?? null,
        registeredCountryISO: referenceData.registered_country?.iso_code ?? null,
        cityName: referenceData.city?.names?.en ?? null,
        subdivisions: describeSubdivisions(referenceData.subdivisions),
        latitude: referenceData.location?.latitude ?? null,
        longitude: referenceData.location?.longitude ?? null,
        timeZone: referenceData.location?.time_zone ?? null,
        accuracyRadiusKm: referenceData.location?.accuracy_radius ?? null,
        postalCode: referenceData.postal?.code ?? null,
    } : null;

    const params = {
        postUrl: portal.componentUrl({}),
        remoteIp: remoteIp,
        lookupIp: lookupIp,
        configuredIp: configuredIp,
        formIp: lookupIp,
        formResolved: formResolved,
        formMissing: !formResolved && !lookupError,
        formCountryISO: geoip.countryISO(formResult),
        formCountryName: geoip.countryName(formResult),
        formCityName: geoip.cityName(formResult),
        formGeoPoint: geoip.geoPoint(formResult),
        formRawJson: formResult ? JSON.stringify(formResult, null, 4) : null,
        lookupError: lookupError,
        knownResults: knownResults,
        ipv6Results: ipv6Results,
        edgeResults: edgeResults,
        dbReady: dbReady,
        dbStatusLabel: dbReady ? 'database-loaded' : 'database-unavailable',
        dbProbeIp: dbProbe.ip,
        referenceIp: reference?.ip ?? '',
        multilingualRows: multilingualRows,
        distinctFields: distinctFields,
    };

    const view = resolve('geoip.html');
    const body = thymeleaf.render(view, params);

    return {
        contentType: 'text/html',
        body: body
    };
}
