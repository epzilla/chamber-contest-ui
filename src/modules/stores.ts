/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { writable } from 'svelte/store';
import { BASE_URL, USER_UPDATED } from './constants';
import { generateGuid } from './helpers';
import WebSockets from './websockets';

export const alerts = writable([]);

export const addAlert = (alert: Alert) => {
  alerts.update(n => {
    const id = generateGuid();
    const timeoutId = setTimeout(() => {
      alerts.update(al => al.filter(a => a.id !== id));
    }, alert.timeout || 5000);

    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      const notif = new Notification('Pong', {
        body: alert.msg
      });
      if (alert.action) {
        notif.addEventListener('click', () => {
          alert.action();
          clearTimeout(timeoutId);
          alerts.update(al => al.filter(a => a.id !== id));
        });
      }
    }
    return [...n, { ...alert, id }];
  });
};

export const dismissAlert = (id: string) => {
  alerts.update(n => n.filter(al => al.id !== id));
};

export const currentMatch = writable({});

let userObj: Member;

if (typeof window !== 'undefined') {
  const userString = localStorage.getItem('user');
  if (userString) {
    userObj = JSON.parse(userString);
  }

  if (userObj && !userObj.isActive) {
    localStorage.removeItem('user');
    window.location.href = '/welcome';
  } else if (!userObj?.isActive && window.location.pathname !== '/welcome') {
    window.location.href = '/welcome';
  } else if (userObj?.isActive && window.location.pathname === '/welcome') {
    window.location.href = '/';
  }
}

export const user = writable<Member | null>(userObj);

if (userObj) {
  fetch(`${BASE_URL}members/member/${userObj.id}`)
    .then(res => {
      if (res.ok) {
        return res.json();
      }
    })
    .then((data: Member) => {
      user.set(data);
      userObj = data;
      if (!data?.isActive) {
        window.localStorage.removeItem('user');
        window.location.href = '/welcome';
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function onUserUpdated(newUser: Member) {
  if (
    typeof window !== 'undefined' &&
    userObj?.id &&
    userObj.id === newUser.id
  ) {
    if (!newUser.isActive) {
      localStorage.removeItem('user');
      window.location.href = '/welcome';
    } else {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  }
  user.set(newUser);
}

if (typeof window !== 'undefined') {
  WebSockets.init(userObj?.id || Date.now(), false).then(() => {
    WebSockets.subscribe(USER_UPDATED, onUserUpdated);
  });
}
