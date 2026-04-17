import {getResponse, handleEvent} from '/lib/sse';

export const GET = getResponse;

export const sseEvent = (event: { type: string; clientId: string }) => handleEvent(event, 'sse-demo-');
