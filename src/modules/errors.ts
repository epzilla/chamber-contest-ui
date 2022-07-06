import { deviceId, user } from './stores';
import { websocketConnection } from './websockets';

deviceId.subscribe(devId => {
  user.subscribe(user => {
    if (typeof window !== 'undefined' && devId && user) {
      window.onerror = function myErrorHandler(
        errorMsg,
        url,
        lineNumber,
        colNumber,
        error
      ) {
        websocketConnection.send(
          JSON.stringify({
            deviceId: devId,
            type: 'error',
            msg: {
              errorMsg,
              stackTrace: error.stack,
              user,
              url,
              lineNumber,
              colNumber
            }
          })
        );
        return false;
      };
    }
  });
});

export {};
