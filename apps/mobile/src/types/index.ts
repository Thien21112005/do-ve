// Shared TypeScript types and interfaces
import type { components, paths } from './api';

export type { components, paths };

export type StationResponse = components['schemas']['StationResponse'];
export type DrawResponse = components['schemas']['DrawResponse'];
// Backward compatibility aliases while adapting screens
export type DrawResultResponse = DrawResponse;
export type WinResponse = components['schemas']['WinResponse'];
export type PrizeWinDto = WinResponse;
export type CheckTicketRequest = components['schemas']['CheckTicketRequest'];
export type CheckTicketResponse = components['schemas']['CheckTicketResponse'];
export type BatchCheckRequest = components['schemas']['BatchCheckRequest'];
export type BatchCheckResponse = components['schemas']['BatchCheckResponse'];
export type AppConfigResponse = components['schemas']['AppConfigResponse'] & {
  storeUrl?: string;
};
export type ProblemDetail = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: string;
};

export type StationCode = string;

/** INVALID: saved for a station that does not draw on that date (T11.16). */
export type SavedTicketStatus = 'WON' | 'LOST' | 'PENDING' | 'INVALID';

export interface SavedTicket {
  id: string;
  ticket: string; // 6 digits, e.g. "012345"
  station: string;
  stationName: string;
  drawDate: string; // YYYY-MM-DD
  status: SavedTicketStatus;
  createdAt: string; // ISO string
  totalPrize: number;
  wins?: WinResponse[];
  note?: string;
}
