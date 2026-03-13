export const data = {
    forceArray: function(data: any): any[] {
        if (!Array.isArray(data)) {
            data = [data];
        }
        return data;
    },

    trimArray: function(array: any[]): any[] {
        const trimmedArray: any[] = [];
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

    deleteEmptyProperties: function(obj: any, recursive?: boolean): void {
        for (const i in obj) {
            if (obj[i] === '') {
                delete obj[i];
            } else if (recursive && typeof obj[i] === 'object') {
                data.deleteEmptyProperties(obj[i], recursive);
            }
        }
    },

    isInt: function(value: any): boolean {
        return !isNaN(value) &&
            parseInt(Number(value) as any) == value &&
            !isNaN(parseInt(value, 10));
    },

    isEmpty: function(obj: any): boolean {
        return Object.keys(obj).length === 0;
    }
};
