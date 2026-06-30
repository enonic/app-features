import {requestHandler} from '/lib/enonic/static';
import type {Request} from '@enonic-types/core';

export const GET = (request: Request) => requestHandler(request, {root: '/assets'});
