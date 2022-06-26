import { Subject } from 'rxjs';
import { Msg } from '../constants';
import { socket } from '../websockets';
import { deviceId } from './';

export const userUpdates = new Subject<Member>();

if (typeof window !== 'undefined') {
  deviceId.subscribe(devId => {
    if (devId) {
      socket.subscribe(({ type, data }) => {
        if (type === Msg.USER_UPDATED) {
          userUpdates.next(data as Member);
        }
      });
    }
  });
}
