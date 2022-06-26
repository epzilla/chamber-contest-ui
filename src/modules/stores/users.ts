import { writable } from 'svelte/store';
import rest from '../rest';

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

if (userObj) {
  rest
    .get(`members/member/${userObj.id}`)
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

export const user = writable<Member | null>(userObj);
