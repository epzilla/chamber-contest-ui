import { Subject } from 'rxjs';
import { Msg, WS_BASE_URL } from './constants';
import { deviceId } from './stores/devices';

type RawSocketUpdate = {
  type: Msg;
  data: string;
  originDeviceId: string;
};

export type SocketUpdate<T> = {
  type: Msg;
  data: T;
};

export let websocketConnection: WebSocket = null;
let initialized = false;
let socketId: string;

export const attendanceUpdates = new Subject<EventAttendanceUpdate>();
export const socket = new Subject<SocketUpdate<unknown>>();

const createWsConnection = devId => {
  socketId = devId;
  websocketConnection = new WebSocket(WS_BASE_URL);
  websocketConnection.onerror = e => console.error(e);
  websocketConnection.onopen = () =>
    console.debug(`WebSocket connection established for device ID: ${devId}`);
  websocketConnection.onclose = () => {
    console.debug('WebSocket connection closed. Attempting to re-connect...');
    createWsConnection(devId);
  };
  websocketConnection.onmessage = m => {
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
      websocketConnection.close();
      createWsConnection(devId);
    }
  }
});
