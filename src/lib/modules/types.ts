export type KVP = {
	key: string;
	value: unknown;
};

export type EventType = {
	id: number;
	type: string;
	label: string;
	points: number;
	isAdHoc: boolean;
};

export type Member = {
	id: number;
	name: string;
	email?: string;
	isAdmin?: boolean;
	isActive?: boolean;
	isSuperuser?: boolean;
	guests?: number;
	names?: string[];
};

export type Attendee = {
	id: number;
	name: string;
	guests: number;
	names: string[];
};

export type ChamberEvent = {
	id?: number;
	eventType?: EventType[];
	dateEntered?: string;
	startTime?: string;
	endTime?: string;
	title?: string;
	address?: string;
	notes?: string;
	isAdHoc?: boolean;
	addToCal?: boolean;
};

export type AttendedChamberEvent = ChamberEvent & {
	guests?: number;
	names?: string[];
};

export type EventAttendance = {
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

export type EventAttendanceUpdate = {
	type: 'add' | 'remove' | 'update';
	event: EventAttendance;
};

export type PointsTotal = {
	memberId: number;
	name: string;
	total: number;
	rank: number;
};

export type PointsTotalWithEvents = PointsTotal & {
	events: EventAttendance[];
	guests: number;
};

export type TimePeriodTotalRsp = {
	events: ChamberEvent[];
	allEventsAttendance: EventAttendance[];
	pointTotals: PointsTotal[];
};

export type EventsByMemberRsp = {
	attended: AttendedChamberEvent[];
	attendedAdHoc: ChamberEvent[];
	attendedNonAdHoc: ChamberEvent[];
	unattended: ChamberEvent[];
};

export type Alert = {
	id?: string;
	type: 'success' | 'error' | 'warning' | 'info' | 'pointsUpdate';
	msg: string;
	action?: () => void;
	clickable?: boolean;
	timeout?: number;
};

export type ValidMonthEntry = {
	month: number;
	year: number;
};

export type FeedEntry = {
	name: string;
	names: string[];
	guests: number;
	notes: string;
	type: string;
	title: string;
	start_time: string;
	timestamp: string;
};

export type MemberStatEntry = {
	memberId: number;
	name: string;
	guests: string;
	count: number;
	total: string;
	names: string[];
	rank: number;
};

export type MemberActivityRsp = {
	events: ChamberEvent[];
	stats: MemberStatEntry;
};

export type ConfigData = {
	submissionsDisabled: boolean;
	submissionsDeadline: string;
};
