/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { WS_BASE_URL } from './constants';

const callbacks = {};
let ws = null;
let deviceId = null;
let initialized = false;
let devMode = false;

const createWsConnection = () => {
  ws = new WebSocket(WS_BASE_URL);
  ws.onerror = e => console.error(e);
  ws.onopen = () =>
    console.debug(
      `WebSocket connection established for device ID: ${deviceId}`
    );
  ws.onclose = () => {
    console.debug('WebSocket connection closed. Attempting to re-connect...');
    createWsConnection();
  };
  ws.onmessage = m => {
    if (devMode && m) {
      console.debug(`[Websockets] Message received`, m);
    }
    if (m?.data) {
      const json = JSON.parse(m.data);
      if (json?.data) {
        fireCallbacks(json);
      } else if (devMode && json) {
        console.debug('[Websockets] Message improperly formatted', json);
      }
    }
  };
  initialized = true;
};

const fireCallbacks = ({ type, data, originDeviceId }) => {
  if (devMode) {
    console.debug({
      type,
      data,
      callbacks,
      originDeviceId,
      deviceId
    });
  }
  if (
    type &&
    data &&
    callbacks[type] &&
    callbacks[type].length > 0 &&
    (!originDeviceId || originDeviceId !== deviceId)
  ) {
    try {
      const json = JSON.parse(data);
      if (json) {
        if (devMode) {
          console.info(json);
        }
        callbacks[type].forEach(cb => cb(json));
      }
    } catch (e) {
      console.error(e);
    }
  }
};

const WebSockets = {
  init: (devId: number, useDevMode: boolean) => {
    return new Promise<void>((resolve, reject) => {
      if (initialized) {
        resolve();
      } else {
        deviceId = devId;
        devMode = !!useDevMode;
        try {
          createWsConnection();
          initialized = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  },

  subscribe: (type, cb) => {
    console.debug(`Subscribing to: ${type}`);
    if (callbacks[type]) {
      callbacks[type].push(cb);
    } else {
      callbacks[type] = [cb];
    }
  },

  unsubscribe: (type, cb) => {
    if (callbacks[type]) {
      console.debug(`Unsubscribing to: ${type}`);
      const i = callbacks[type].findIndex(fn => fn === cb);
      if (i !== -1) {
        callbacks[type].splice(i, 1);
      }
    }
  },

  setDeviceId: id => {
    deviceId = id;
  },

  send: (type, msg) => {
    ws.send(JSON.stringify({ type, msg, deviceId }));
  }
};

export default WebSockets;
