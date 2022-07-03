/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export const WS_BASE_URL = 'wss://chamber-api.herokuapp.com';
export const BASE_URL = 'https://chamber-api.herokuapp.com/';

export const ROUTES = [
  { title: 'Home', href: '/' },
  { title: 'Upcoming Events', href: '/events/upcoming' },
  { title: 'Past Events', href: '/events/past' },
  { title: 'Points Contest', href: '/contest' },
  { title: 'Log Out', href: '/logout' },
  { title: 'Admin', href: '/admin', isAdmin: true }
];

// Websocket message types
export enum Msg {
  USER_UPDATED = 'USER_UPDATED',
  EVENT_ATTENDANCE_UPDATED = 'EVENT_ATTENDANCE_UPDATED'
}

export enum ActivityTypes {
  CALL_EMAIL = 'CALL_EMAIL',
  DELIVERY = 'DELIVERY',
  EVENT = 'EVENT'
}

export enum SubActivityTypes {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  CALL_AND_EMAIL = 'CALL_AND_EMAIL'
}

// strings
export const SITE_TITLE = 'Home Run Challenge';
