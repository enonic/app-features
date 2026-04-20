export const data = {
    forceArray: function(data: unknown): unknown[] {
        if (!Array.isArray(data)) {
            return [data];
        }
        return data;
    },

    trimArray: function(array: Record<string, unknown>[]): Record<string, unknown>[] {
        const trimmedArray: Record<string, unknown>[] = [];
        for (let i = 0; i < array.length; i++) {
            let empty = true;
            const object = array[i];

            for (const key in object) {
                if (object[key] !== '') {
                    empty = false;
                }
            }
            if (!empty) {
                trimmedArray.push(object);
            }
        }
        return trimmedArray;
    },

    deleteEmptyProperties: function(obj: Record<string, unknown>, recursive?: boolean): void {
        for (const i in obj) {
            if (obj[i] === '') {
                delete obj[i];
            } else if (recursive && typeof obj[i] === 'object') {
                data.deleteEmptyProperties(obj[i] as Record<string, unknown>, recursive);
            }
        }
    },

    isInt: function(value: number | string): boolean {
        return !isNaN(value as number) &&
            parseInt(Number(value) as unknown as string) == value &&
            !isNaN(parseInt(String(value), 10));
    },

    isEmpty: function(obj: object): boolean {
        return Object.keys(obj).length === 0;
    }
};
