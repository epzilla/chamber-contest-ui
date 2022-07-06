/// <reference types="@sveltejs/kit" />
type KVP = {
  key: string | enum;
  value: unknown;
};

type EventType = {
  id: number;
  type: string;
  points: number;
};

type Member = {
  id: number;
  name: string;
  email?: string;
  isAdmin?: boolean;
  isActive?: boolean;
};

type ChamberEvent = {
  id: number;
  eventType: EventType[];
  dateEntered?: string;
  startTime: string;
  endTime?: string;
  title: string;
  address?: string;
  notes?: string;
  isAdHoc?: boolean;
  addToCal?: boolean;
};

type EventAttendance = {
  memberId: number;
  eventId: number;
  eventTypeId: number;
  startTime: string;
  dateEntered: string;
  title: string;
  type: string;
  points: number;
  name: string;
  guests: number;
  names: { name: string; org: string }[];
  org: string;
};

type EventAttendanceUpdate = {
  type: 'add' | 'remove' | 'update';
  event: EventAttendance;
};

type PointsTotal = {
  memberId: number;
  name: string;
  total: number;
  rank: number;
};

type PointsTotalWithEvents = PointsTotal & {
  events: EventAttendance[];
  guests: number;
};

type TimePeriodTotalRsp = {
  events: ChamberEvent[];
  allEventsAttendance: EventAttendance[];
  pointTotals: PointsTotal[];
};

type EventsByMemberRsp = {
  attended: ChamberEvent[];
  attendedAdHoc: ChamberEvent[];
  attendedNonAdHoc: ChamberEvent[];
  unattended: ChamberEvent[];
};

type Alert = {
  id?: string;
  type: string;
  msg: string;
  action?: () => void;
  clickable?: boolean;
  timeout?: number;
};

type ValidMonthEntry = {
  month: number;
  year: number;
};
