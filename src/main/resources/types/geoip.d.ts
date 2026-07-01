declare module '/lib/geoip' {
    export interface LocationNames {
        en?: string;

        [language: string]: string | undefined;
    }

    export interface ContinentInfo {
        code?: string;
        names?: LocationNames;
        geoname_id?: number;
    }

    export interface CountryInfo {
        iso_code?: string;
        names?: LocationNames;
        geoname_id?: number;
    }

    export interface CityInfo {
        names?: LocationNames;
        geoname_id?: number;
    }

    export interface LocationInfo {
        latitude?: number;
        longitude?: number;
        time_zone?: string;
        metro_code?: number;
        accuracy_radius?: number;
    }

    export interface PostalInfo {
        code?: string;
    }

    export interface SubdivisionInfo {
        iso_code?: string;
        names?: LocationNames;
        geoname_id?: number;
    }

    export interface LocationData {
        continent?: ContinentInfo;
        country?: CountryInfo;
        registered_country?: CountryInfo;
        city?: CityInfo;
        location?: LocationInfo;
        postal?: PostalInfo;
        subdivisions?: SubdivisionInfo[];
    }

    export function getLocationData(ip?: string | null): LocationData | null;

    export function cityName(locationData: LocationData | null, language?: string): string | null;

    export function countryName(locationData: LocationData | null, language?: string): string | null;

    export function countryISO(locationData: LocationData | null): string | null;

    export function geoPoint(locationData: LocationData | null): string | null;

    export function test(trace?: boolean): string;
}

export {};
