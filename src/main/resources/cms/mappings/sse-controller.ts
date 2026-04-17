import {getResponse, handleEvent} from '/lib/sse';

export const get = getResponse;

export const sseEvent = (event: { type: string; clientId: string }) => handleEvent(event, 'sse-mapping-');
