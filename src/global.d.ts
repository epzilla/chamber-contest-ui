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
  member: Member;
  event: ChamberEvent;
};

type Alert = {
  id: string;
  type: string;
  msg: string;
  action?: () => void;
  clickable?: boolean;
  timeout?: number;
};
