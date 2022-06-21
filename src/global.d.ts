/// <reference types="@sveltejs/kit" />

type EventType = {
  id: number;
  type: string;
  points: number;
};

type Member = {
  id: number;
  name: string;
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
