/// <reference types="@sveltejs/kit" />

type EventType = {
  id: number;
  type: string;
  points: number;
};

type Member = {
  id: number;
  name: string;
  isAdmin?: boolean;
  isActive?: boolean;
};

type ChamberEvent = {
  id: number;
  guests: number;
  eventType: EventType[];
  dateOfEvent: string;
  dateEntered: string;
  startTime: string;
  endTime: string;
  title: string;
  address?: string;
  notes?: string;
  isAdHoc?: boolean;
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
  business: string;
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

type Alert = {
  id: string;
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
