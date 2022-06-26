import { Subject } from 'rxjs';
import { WS_BASE_URL } from './constants';
import { deviceId } from './stores/devices';

enum Msg {
  USER_UPDATED = 'USER_UPDATED',
  EVENT_ATTENDANCE_UDATED = 'EVENT_ATTENDANCE_UDATED'
}

type RawSocketUpdate = {
  type: Msg;
  data: any;
  originDeviceId: string;
};

export type SocketUpdate<T> = {
  type: Msg;
  data: T;
};

let ws: WebSocket = null;
let initialized = false;
let socketId: string;

export const attendanceUpdates = new Subject<ChamberEvent>();
export const socket = new Subject<SocketUpdate<unknown>>();

const createWsConnection = devId => {
  socketId = devId;
  ws = new WebSocket(WS_BASE_URL);
  ws.onerror = e => console.error(e);
  ws.onopen = () =>
    console.debug(`WebSocket connection established for device ID: ${devId}`);
  ws.onclose = () => {
    console.debug('WebSocket connection closed. Attempting to re-connect...');
    createWsConnection(devId);
  };
  ws.onmessage = m => {
    if (m?.data) {
      const json = JSON.parse(m.data);
      if (json?.data) {
        fireCallbacks(json);
      } else if (json) {
        console.debug('[Websockets] Message improperly formatted', json);
      }
    }
  };
  initialized = true;
};

const fireCallbacks = ({ type, data, originDeviceId }: RawSocketUpdate) => {
  if (type && data && (!originDeviceId || originDeviceId !== socketId)) {
    try {
      const json = JSON.parse(data);
      if (json) {
        socket.next({ type, data: json });
      }
    } catch (e) {
      console.error(e);
    }
  }
};

deviceId.subscribe(devId => {
  if (devId) {
    if (!initialized) {
      createWsConnection(devId);
    } else {
      ws.close();
      createWsConnection(devId);
    }
  }
});
