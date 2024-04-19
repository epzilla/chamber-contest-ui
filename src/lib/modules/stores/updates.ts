import { Subject } from 'rxjs';
import { Msg } from '../constants';
import { attendanceUpdates, socket } from '../websockets';
import { deviceId } from './devices';
import type { Member, EventAttendanceUpdate } from '../types';

export const userUpdates = new Subject<Member>();

if (typeof window !== 'undefined') {
	deviceId.subscribe((devId) => {
		if (devId) {
			socket.subscribe(({ type, data }) => {
				switch (type) {
					case Msg.USER_UPDATED:
						userUpdates.next(data as Member);
						break;
					case Msg.EVENT_ATTENDANCE_UPDATED:
						attendanceUpdates.next(data as EventAttendanceUpdate);
						break;
				}
			});
		}
	});
}
