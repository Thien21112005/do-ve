// Shared TypeScript types and interfaces
import type { components, paths } from './api';

export type { components, paths };

export type StationResponse = components['schemas']['StationResponse'];
export type DrawResultResponse = components['schemas']['DrawResultResponse'];
export type PrizeWinDto = components['schemas']['PrizeWinDto'];
export type CheckTicketRequest = components['schemas']['CheckTicketRequest'];
export type CheckTicketResponse = components['schemas']['CheckTicketResponse'];
export type BatchCheckRequest = components['schemas']['BatchCheckRequest'];
export type BatchCheckResponse = components['schemas']['BatchCheckResponse'];
export type AppConfigResponse = components['schemas']['AppConfigResponse'];
export type ProblemDetail = components['schemas']['ProblemDetail'];

export type StationCode = string;
