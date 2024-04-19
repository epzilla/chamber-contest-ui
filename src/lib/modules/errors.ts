import { deviceId, user } from './stores';
import { websocketConnection } from './websockets';

let loggedInUser: Member | null = null;
let loggedInDevice: string | null = null;

user.subscribe(user => {
  loggedInUser = user;
});

deviceId.subscribe(devId => {
  loggedInDevice = devId;
});

export function logCaughtError(error: Error) {
  if (typeof window !== 'undefined' && loggedInDevice && loggedInUser) {
    websocketConnection.send(
      JSON.stringify({
        type: 'error',
        msg: {
          errorMsg: error.message,
          stackTrace: error.stack,
          user: loggedInUser,
          url: window.location.href
        }
      })
    );
  }
}

if (typeof window !== 'undefined') {
  window.onerror = function myErrorHandler(
    errorMsg,
    url,
    lineNumber,
    colNumber,
    error
  ) {
    if (loggedInDevice && loggedInUser) {
      websocketConnection.send(
        JSON.stringify({
          deviceId: loggedInDevice,
          type: 'error',
          msg: {
            errorMsg,
            stackTrace: error.stack,
            user: loggedInUser,
            url,
            lineNumber,
            colNumber
          }
        })
      );
    }
    return false;
  };
}
