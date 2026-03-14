type KeyValuePair<K extends PropertyKey, V> = [K, V];

export const dict = <K extends PropertyKey, V>(arr: KeyValuePair<K, V>[]): Record<K, V> => Object.fromEntries(arr) as Record<K, V>;
